# STEG-IT.

Steganography utility to hide messages into images (png, jpeg, bmp).

### Installation.

* It's necessary to have installed the NodeJS environment. If it's not installed, go to NodeJS's web https://nodejs.org/es/.
  Within the environment is available the package manager npm required to install STEG-IT.
* Execute the command ```git clone repository_address``` in the folder where you wish to install STEG-IT.
* Place yourself into the folder and execute ```npm install``` to initialize the project with the required dependencies.

### Usage instructions.
* First, you must place yourself into the project's folder.
* The command ```node stegIt-cli --help``` shows the general help for the application with the available options.
* Each suboption (```hide``` to hide a message and ```reveal``` to recover it) have its individual help to see its options, for
  example, to see the help of ```hide```, you have to execute the command ```node stegIt-cli hide --help```.

  #### Hide message.
  * To hide a message into an image, the most basic command will be ```node stegIt-cli hide <path_image>``` that will ask for 
    insertion of the message by keyboard.
  * It's available too the option to read the message from a file using the command ```node stegIt-cli hide --file <path_file> <path_image>```.
  * The resulting image will be saved within the same folder of the original with "_hacked" appended at the end.
  * By default, the bits rate used (number of bits to encode by component rgb) is 4. It's possible to change it with the option
    ```--bits``` of ```hide```.

  #### Recover message.
  * To extract a hided message from an image, it's must execute the command ```node stegIt-cli reveal <path_image>``` where
    path_image corresponds to the path of the image with the hided message.
  * By default, the bits rate used (number of bits to encode by component rgb) is 4. It's possible to change it with the option
    ```--bits``` of ```hide```.

### Credits.
  This application uses external Open Source libraries. Next it's show the addresses of the libraries's code sources along with their
  licenses.

  * Project: number-converter
    <br>Copyright (c) 2015 Brett McLean
    <br>License (MIT) https://github.com/brettmclean/number-converter/blob/master/LICENSE
  * Project: bitwise
    <br>Copyright (c) 2016 Florian Wendelborn
    <br>License (MIT) https://github.com/dodekeract/bitwise/blob/master/license.md
  * Project: convert-string
    <br>Copyright 2013, JP Richardson
    <br>License (MIT)
  * Project: prompt
    <br>Copyright (c) 2010 Nodejitsu Inc
    <br>License (MIT) https://github.com/flatiron/prompt/blob/master/LICENSE
  * Project: jimp
    <br>Copyright (c) 2014 Oliver Moran
    <br>License (MIT) https://github.com/oliver-moran/jimp/blob/master/LICENSE



### Autor.
Ernesto Boado.