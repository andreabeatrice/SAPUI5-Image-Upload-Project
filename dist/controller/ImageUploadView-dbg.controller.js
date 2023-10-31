sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/m/MessageToast',
	"sap/m/upload/Uploader",
	"sap/ui/core/Fragment"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, MessageToast, Uploader,Fragment) {
        "use strict";

        return Controller.extend("imageuploadproject.controller.ImageUploadView", {
            onInit: function () {
                this.byId("problemInfoStrip").setVisible(false);
                
                localStorage.setItem('cropped', false);
               
            },

            onImageLoaded: function(){
                var oFileUploader = this.byId("fileUploader").oFileUpload;

                console.log(typeof localStorage.getItem('cropped'))
                

                if(localStorage.getItem('cropped') === "false"){
                    this.cropImage();
                    this.onOpenDialog();
                }
                
            },
            onOpenDialog : function () {
    
                // create dialog lazily
                if (!this.pDialog) {
                    this.pDialog = this.loadFragment({
                        name: "imageuploadproject.view.BusyDialog"
                    });
                } 
                this.pDialog.then(function(oDialog) {
                    oDialog.open();
                });
            },

            cropImage: function () {
                var IUVController = this;
                var oMessageStrip = this.byId("problemInfoStrip");

                var oFileUploader = this.byId("fileUploader").oFileUpload;

                var imgPath = oFileUploader.files[0];

                var reader = new FileReader();
                reader.onload = function (e) {
                    var blob = new Blob([e.target.result]);

                    var mycropHeaders = new Headers();
                    mycropHeaders.append("Ocp-Apim-Subscription-Key", "7ed21d6720754ade9dac6191b9b26e9a");
                    mycropHeaders.append("Content-Type", "application/octet-stream");

                    var requestCropOptions = {
                        method: 'POST',
                        headers: mycropHeaders,
                        body: blob,
                        redirect: 'follow'
                    };
                    fetch("https://nedbankcropimage.cognitiveservices.azure.com/vision/v3.2/generateThumbnail?smartCropping=true&width=1000&height=1000", requestCropOptions)
                        .then(response => {
                            return response.blob();
                        })
                        .then(blob => {
                            console.log(blob)

                            const imageUrl = URL.createObjectURL(blob);

                            const imgElement = IUVController.getView().byId('imageEd');
                            imgElement.setSrc(imageUrl);
                            localStorage.setItem('cropped', true);

                            if(IUVController.pDialog) {
                                IUVController.pDialog.then(function(oDialog) {
                                    oDialog.close();
                                });
                            }
                            
                            
                            
                            ///IUVController.getView().byId("image").setSrc(imageUrl);
                            oMessageStrip.setText("Profile Image has been successfully uploaded");
                            oMessageStrip.setType("Success");
                            oMessageStrip.setVisible(true);

                            // Add an error handler for the img element
                            imgElement.onerror = () => {

                                oMessageStrip.setText("Not uploaded— The profile image is larger than 4Mb. <br><br> <strong>Upload a new image that meets the following standards:</strong> <br> *Your picture must contain an identifiable face. <br> *Your picture should only have one (1) person in it. <br> *You shouldn't have glasses, sunglasses, or a mask on in your picture. <br> *You should be easily recognizable in your picture. <br> *The Image should not be larger than 4Mb.");
                                oMessageStrip.setType("Error");
                                oMessageStrip.setVisible(true);
                                IUVController.getView().byId("image").setSrc("");

                            };

                        })
                        .catch(error => {
                            console.log(error)
                        });


                };
                reader.onerror = function (e) {
                    // error occurred
                    console.log('Error : ' + e.type);
                };

                reader.readAsArrayBuffer(imgPath);

            }, 
    
            handleUploadPress: function() {

                var IUVController = this;
                var oFileUploader = this.byId("fileUploader").oFileUpload;
                //var myURL = URL.createObjectURL(oFileUploader);
                var imgPath = oFileUploader.files[0];

                

                var oImageEditor = this.getView().byId("imageEd");

                oImageEditor.getImageAsBlob().then(function(oBlob) {

                    if(oBlob){
                        IUVController.sendToAPI(IUVController, oBlob);
                        localStorage.setItem('profileImage', window.URL.createObjectURL(oBlob));
                        
                    }
                    else {
                        IUVController.sendToAPI(IUVController, imgPath);
                        console.log(oBlob);
                    }
                    

                });
                


            },

            sendToAPI: function(IUVController, imagePath){
                var reader = new FileReader();
                reader.onload = function(e) {
                    // binary data
                   console.log(e.target.result);

                   var blob = new Blob([e.target.result]);

                   var myHeaders = new Headers();
                    myHeaders.append("Ocp-Apim-Subscription-Key", "0e9bb2dd6b654978889f5ac9ddd858f1");
                    myHeaders.append("Content-Type", "application/octet-stream");

                    var requestOptions = {
                        method: 'POST',
                        headers: myHeaders,
                        body: blob,
                        redirect: 'follow'
                        };
        
                        fetch("https://bankimagefaceapi.cognitiveservices.azure.com/face/v1.0/detect?returnFaceId=false&returnFaceAttributes=glasses,qualityForRecognition&returnFaceLandmarks=true&recognitionModel=recognition_04&returnRecognitionModel=false&detectionModel=detection_01", requestOptions)
                        .then(response => response.text())
                        .then(result =>  IUVController.readValues(result))
                        .catch(error => console.log('error', error));

                };
                reader.onerror = function(e) {
                    // error occurred
                    console.log('Error : ' + e.type);
                };  

                reader.readAsArrayBuffer(imagePath);
            },

            handleTypeMissmatch: function(oEvent) {
                var aFileTypes = oEvent.getSource().getFileType();
                aFileTypes.map(function(sType) {
                    return "*." + sType;
                });

                this.byId("problemInfoStrip").setText("The file type *." + oEvent.getParameter("fileType") + " is not supported. Choose one of the following types: " +aFileTypes.join(", "));
                this.byId("problemInfoStrip").setType("Error");
                this.byId("problemInfoStrip").setVisible(true);
            },
    
            handleValueChange: function(oEvent) {
                var oFile = oEvent.getParameter("files")[0];
                this.byId("imageEd").setSrc(oFile);
                localStorage.setItem('cropped', false);
            },

            readValues: function(res) {
                
                var data = JSON.parse(res);
                var oMessageStrip = this.byId("problemInfoStrip");
                
                console.log(data)

                if (data.error)
                {
                    oMessageStrip.setText("Not uploaded. There was an error");
                    oMessageStrip.setType("Error");
                    oMessageStrip.setVisible(true);
                    //MessageToast.show("Profile Image could not be uploaded");
                }
                else if (data == '')
                {
                    //MessageToast.show("Profile Image could not be uploaded. The selected image must contain a face");
                    oMessageStrip.setText("Not uploaded—the picture you uploaded doesn't contain an identifiable face. <br><br> <strong>Upload a new image that meets the following standards:</strong> <br> *Your picture must contain an identifiable face. <br> *Your picture should only have one (1) person in it. <br> *You shouldn't have glasses, sunglasses, or a mask on in your picture. <br> *You should be easily recognizable in your picture. <br><br> If the system is consistently not identifying your face, or you wear a face covering for religious resons, <a target='_blank' href='http://www.sap.com'>request a review here</a>." );
                    oMessageStrip.setType("Error");
                    oMessageStrip.setVisible(true);
                }
                else
                {
                    for (var k in data)
                    {
                       var glasses = (data[k].faceAttributes.glasses)
                       var recog = data[k].faceAttributes.qualityForRecognition;
                    
                    if (k > 0){
                        //MessageToast.show("Profile Image could not be uploaded. The selected image is restricted to a single individual face only."); 
                        oMessageStrip.setText("Not uploaded—you should be the only person in your profile picture. <br><br> <strong>Upload a new image that meets the following standards:</strong> <br> *Your picture must contain an identifiable face. <br> *Your picture should only have one (1) person in it. <br> *You shouldn't have glasses, sunglasses, or a mask on in your picture. <br> *You should be easily recognizable in your picture.");
                        oMessageStrip.setType("Error");
                        oMessageStrip.setVisible(true);
                    }
                    else if ( data.length == 1 && glasses == "ReadingGlasses" || glasses == "sunglasses") {
                        //MessageToast.show("Profile Image cannot be uploaded. The selected image must not contain glasses.");
                        oMessageStrip.setText("Not uploaded—your profile picture must not contain glasses <br><br> <strong>Upload a new image that meets the following standards:</strong> <br> *Your picture must contain an identifiable face. <br> *Your picture should only have one (1) person in it. <br> *You shouldn't have glasses, sunglasses, or a mask on in your picture. <br> *You should be easily recognizable in your picture.");
                        oMessageStrip.setType("Error");
                        oMessageStrip.setVisible(true);
                    }

                    else if (data.length == 1 && glasses == "NoGlasses" && recog == "high" )
                    {
                        //MessageToast.show("Profile Image has been successfully uploaded");
                        oMessageStrip.setText("Profile Image has been successfully uploaded");

                        oMessageStrip.setType("Success");
                        oMessageStrip.setVisible(true);
                        //this.cropImage();
                        this.getView().byId("img").setSrc(localStorage.getItem('profileImage'));
                    }

                    else {
                        //MessageToast.show("You are not recognizable in this image.");
                        oMessageStrip.setText("Not uploaded—you are not recognizable in this image. <br><br> <strong>Upload a new image that meets the following standards:</strong> <br> *Your picture must contain an identifiable face. <br> *Your picture should only have one (1) person in it. <br> *You shouldn't have glasses, sunglasses, or a mask on in your picture. <br> *You should be easily recognizable in your picture.  <br><br> If the system is consistently not identifying your face, or you wear a face covering for religious resons, <a target='_blank' href='http://www.sap.com'>request a review here</a>.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    ");

                        oMessageStrip.setType("Error");
                        oMessageStrip.setVisible(true);
                    }

    
                    
                    }
                }
          

                
            }
        });
    });
