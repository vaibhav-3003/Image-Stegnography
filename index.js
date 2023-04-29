let encode_dropzone_file = document.getElementById('encode_dropzone-file');
let decode_dropzone_file = document.getElementById('decode_dropzone-file');

let encode_image_holder = document.getElementById('encode_image_holder');
let encode_upload_button = document.getElementById('encode_upload_button');

let decode_image_holder = document.getElementById('decode_image_holder');
let decode_upload_button = document.getElementById('decode_upload_button');

let encode_image_button = document.getElementById('encode_image_button');
let decode_image_button = document.getElementById('decode_image_button');

let message_input = document.getElementById('message');

let image_file_for_encode = "";
let image_file_for_decode = "";

let canvas = document.getElementById("imageCanvas");
let ctx = canvas.getContext("2d");
let textCanvas = document.getElementById("textCanvas");
let tctx = textCanvas.getContext("2d");

let popup_modal = document.getElementById("popup-modal");
let open_popup = document.getElementById("open_popup");
let download = popup_modal.querySelector("#download");

//handle decoding
let decodeCanvas = document.getElementById("imageCanvas2");
let dctx = decodeCanvas.getContext("2d");

encode_dropzone_file.addEventListener("change", (event) => {
  image_file_for_encode = event.target.files[0];
  let reader = new FileReader();
  reader.readAsDataURL(event.target.files[0]);
  reader.onload = () => {
    encode_upload_button.classList.add('hidden');
    encode_image_holder.classList.remove('hidden');
    encode_image_holder.setAttribute('src',reader.result);
  }
  
});
decode_dropzone_file.addEventListener("change", (event) => {
  image_file_for_decode = event.target.files[0];
  let reader = new FileReader();
  reader.readAsDataURL(event.target.files[0]);
  reader.onload = () => {
    decode_upload_button.classList.add('hidden');
    decode_image_holder.classList.remove('hidden');
    decode_image_holder.setAttribute('src',reader.result);
  }
});

//Start Encoding the image on button click
encode_image_button.addEventListener('click',()=>{
  let message = message_input.value.trim();
  if(image_file_for_encode==="" || message===""){
    console.log("Fill all the fields");
  }else{
    let reader = new FileReader();
    reader.readAsDataURL(image_file_for_encode);
    reader.onload = () => {
      let image = new Image();
      image.onload = () => {
        encodeImage(image, message);
      };
      image.src = reader.result;
      open_popup.click();
      const downloadLinks = popup_modal.querySelectorAll("[data-download]");

      downloadLinks.forEach((button) => {
        const id = button.dataset.download;
        const img = document.getElementById(id);
        img.addEventListener("load", () => {
          const a = document.createElement("a");
          a.href = img.src;
          console.log(a.href);
          a.download = "";
          a.style.display = "none";

          button.addEventListener("click", () => {
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }); 
        });

        
      });
    };
  }
 
});

//Start Decoding the image on button click
decode_image_button.addEventListener('click',()=>{
  if(image_file_for_decode===""){
    console.log("Fill all the fields");
  }else{
    let reader = new FileReader();
    reader.readAsDataURL(image_file_for_decode);
    reader.onload = () => {
      let image = new Image();
      image.onload = () => {
        decodeImage(image);
      };
      image.src = reader.result;
    }
  }
});


//Function to encode the image with the message
function encodeImage(image,message){
  canvas.width = image.width;
  canvas.height = image.height;
  textCanvas.width = image.width;
  textCanvas.height = image.height;
  tctx.font = "30px Arial";
  
  let messageText = message.length ? message : "Hello";
  tctx.fillText(messageText, 10, 50);
  ctx.drawImage(image, 0, 0);
  let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let textData = tctx.getImageData(0, 0, canvas.width, canvas.height);
  let pixelsInMsg = 0;
  pixelsOutMsg = 0;
  for (let i = 0; i < textData.data.length; i += 4) {
    if (textData.data[i + 3] !== 0) {
      if (imgData.data[i + 1] % 10 == 7) {
        //do nothing, we're good
      } else if (imgData.data[i + 1] > 247) {
        imgData.data[i + 1] = 247;
      } else {
        while (imgData.data[i + 1] % 10 != 7) {
          imgData.data[i + 1]++;
        }
      }
      pixelsInMsg++;
    } else {
      if (imgData.data[i + 1] % 10 == 7) {
        imgData.data[i + 1]--;
      }
      pixelsOutMsg++;
    }
    
  }
  console.log("pixels within message borders: " + pixelsInMsg);
  console.log("pixels outside of message borders: " + pixelsOutMsg);
  ctx.putImageData(imgData, 0, 0);

  // Display the output image
  const outputImage = document.getElementById("output-image");
  outputImage.src = canvas.toDataURL();
}

//Function to decode the image
function decodeImage(image){
  decodeCanvas.width = image.width;
  // decodeCanvas.height = ;
  dctx.fillStyle = "#ff0000";
  dctx.drawImage(image, 0, 0);
  
  let decodeData = dctx.getImageData(
    0,
    0,
    decodeCanvas.width,
    decodeCanvas.height
  );
  for (let i = 0; i < decodeData.data.length; i += 4) {
    if (decodeData.data[i + 1] % 10 == 7) {
      decodeData.data[i] = 0;
      decodeData.data[i + 1] = 0;
      decodeData.data[i + 2] = 0;
      decodeData.data[i + 3] = 255;
    } else {
      decodeData.data[i + 3] = 0;
    }
  }
  
  dctx.putImageData(decodeData, 0, 0);
  decodeCanvas.classList.remove('hidden');
}