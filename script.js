var c = document.getElementById("output_image_canvas");
var ctx = c.getContext("2d");

function noPreview() {
    $('#image-preview-div').css("display", "none");
    $('#preview-img').attr('src', 'noimage');
    $('upload-button').attr('disabled', '');
}

function selectImage(e) {

    $('#file').css("color", "black");
    $('#image-preview-div').css("display", "block");
    $('#preview-img').attr('src', e.target.result);
    $('#preview-img').css('max-width', '550px');

    var image = new Image();
    image.src = e.target.result;

    image.onload = function () {

        //Get image height and width
        var imgWidth = this.width;
        var imgHeight = this.height;

        //Set canvas height and width
        ctx.canvas.width = imgWidth;
        ctx.canvas.height = imgHeight;

    };

    //Set Canvas Background
    $('#output_image_canvas').css("background-image", "url(" + e.target.result + ")");
}

//Random Color Generation Function
function getRandomColor() {

    let colorArr = ['#ef351a', '#2d8015', '#f5ac2a', '#1a00fa', '#000000'];

    return colorArr[Math.floor(Math.random() * colorArr.length)];
}

//Image object detection function
function detectObjectsOnImage(objectDetections, type = 'face') {

    objectDetections.forEach(function (item) {

        let coordinates = item.coordinates;
        let title = '';

        if (type === 'face') {
            title = item.face_name;
        } else {
            title = item.object_title;
        }

        let x1 = coordinates.split(',')[0];
        let x2 = coordinates.split(',')[1];
        let y1 = coordinates.split(',')[2];
        let y2 = coordinates.split(',')[3];


        ctx.lineWidth = 4;
        ctx.fillStyle = "#00ca00";
        ctx.font = "30px Arial";
        ctx.fillText(title, x1, (y1 - 10));

        ctx.strokeStyle = getRandomColor();
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y1);
        ctx.stroke();


        ctx.beginPath();
        ctx.moveTo(x2, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();


        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x1, y2);
        ctx.stroke();


        ctx.beginPath();
        ctx.moveTo(x1, y2);
        ctx.lineTo(x1, y1);
        ctx.stroke();

    });
}

$(document).ready(function (e) {

    var maxsize = 4096 * 1024; // 4096 KB

    $('#max-size').html((maxsize / 1024).toFixed(2));

    $('#upload-image-form').on('submit', function (e) {

        e.preventDefault();

        $('#message').empty();
        $('#loading').show();

        let scanResultTableBody = $('.scanResultTableBody');
        let scanResultCard = $('.scanResultCard');

        $.ajax({
            url: "https://api.chooch.ai/predict/image?apikey=f19a747a-d6a2-48f7-b692-6542d20a3d17",
            type: "POST",
            data: new FormData(this),
            contentType: false,
            cache: false,
            processData: false,
            success: function (data) {

                console.log(data);

                let objectsPredictions = data.objects.predictions;
                let objectPredictionsSummary = data.objects.summary;
                let faceDetections = data.faces.predictions;
                let objectDetections = data.objects.predictions;


                //Calls Image Face Detection Identifier Function
                detectObjectsOnImage(faceDetections);

                //Calls Image Object Detection Identifier Function
                detectObjectsOnImage(objectDetections, 'object');

                let rowMarkUp = '';

                objectPredictionsSummary.forEach(function (item) {

                    let object_title = item.object_title;

                    rowMarkUp += '<tr><td>' + object_title.toUpperCase() + '</td><td>' + item.count + '</td></tr>';

                });

                $('#loading').hide();

                scanResultTableBody.html(rowMarkUp);

                scanResultCard.show();

            }
        });

    });

    $('#file').change(function () {

        var file = this.files[0];
        var match = ["image/jpeg", "image/png", "image/jpg"];

        if (!((file.type == match[0]) || (file.type == match[1]) || (file.type == match[2]))) {
            noPreview();

            $('#message').html('<div class="alert alert-warning" role="alert">Unvalid image format. Allowed formats: JPG, JPEG, PNG.</div>');

            return false;
        }

        if (file.size > maxsize) {
            noPreview();

            $('#message').html('<div class=\"alert alert-danger\" role=\"alert\">The size of image you are attempting to upload is ' + (file.size / 1024).toFixed(2) + ' KB, maximum size allowed is ' + (maxsize / 1024).toFixed(2) + ' KB</div>');

            return false;
        }

        $('#upload-button').removeAttr("disabled");

        var reader = new FileReader();
        reader.onload = selectImage;
        reader.readAsDataURL(this.files[0]);

    });

});