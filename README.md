## Application Details
|               |
| ------------- |
|**Generation Date and Time**<br>Thu Apr 13 2023 13:28:12 GMT+0000 (Coordinated Universal Time)|
|**App Generator**<br>@sap/generator-fiori-freestyle|
|**App Generator Version**<br>1.9.3|
|**Generation Platform**<br>SAP Business Application Studio|
|**Template Used**<br>simple|
|**Service Type**<br>None|
|**Service URL**<br>N/A
|**Module Name**<br>image-upload-project|
|**Application Title**<br>Image Upload Project|
|**Namespace**<br>|
|**UI5 Theme**<br>sap_horizon|
|**UI5 Version**<br>1.112.1|
|**Enable Code Assist Libraries**<br>False|
|**Enable TypeScript**<br>False|
|**Add Eslint configuration**<br>False|

## image-upload-project

First a user uploads an image, and it is cropped to the focus point by the Microsoft API. They are then given a chance to adjust the image. Once they press "Upload", the image is sent to the Microsoft Face API, which checks if the user is wearing glasses/sunglasses, and how easily recognizable they are in the photo. If the quality for recognition is less than "high" or the photo doesn't meet one of the other requirements, it's not uploaded. Otherwise, it is accepted as the new profile picture, which is shown the the demo by placing it next to the image editor. When we tested it, we found that the Face API sometimes struggles with recognizing dark-skinned black women and that it also doesn't always accept images where women are wearing face coverings for religious purposes (like niqabs) so we've added a link to request a manual review—it doesn't currently do anything, but it would probably end up being a mailto link to someone who has the permissions to change profile pictures without going through this process.

### Starting the generated app

-   This app has been generated using the SAP Fiori tools - App Generator, as part of the SAP Fiori tools suite.  In order to launch the generated app, simply run the following from the generated app root folder:

```
    npm start
```

#### Pre-requisites:

1. Active NodeJS LTS (Long Term Support) version and associated supported NPM version.  (See https://nodejs.org)


