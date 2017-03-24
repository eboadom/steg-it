# STEG-IT.

Utilidad de esteganografía para ocultar mensajes en imágenes.

### Instalación.

* Es necesario tener instalado el entorno NodeJS. Si no está instalado, hacerlo desde la página principal de NodeJS https://nodejs.org/es/.
Incluído con el entorno ya vendrá el gestor de paquetes npm necesario para instalar STEG-IT.
* Ejecutar el comando ```git clone dirección_repositorio``` en la carpeta donde se desee instalar STEG-IT.
* Colocarse dentro de la carpeta y ejecutar el comando ```npm install``` para inicializar el proyecto con las dependencias requeridas.

### Instrucciones de uso.
* Primero hay que navegar con la terminal de comandos a la carpeta del proyecto.
* Ejecutando el comando ```node stegIt-cli --help``` se podrán ver todas las opciones disponibles en STEGIT.
* Cada subcomando (```hide``` para ocultar un mensaje y ```reveal``` para recuperar un mensaje oculto de una imagen) dispone de su 
  ayuda particular para ver sus opciones, por ejemplo, para ver la ayuda de ```hide``` habrá que ejecutar el comando ```node stegIt-cli hide --help```.

  #### Ocultar mensaje
  * Para ocultar un mensaje en una imagen, el comando más básico sería ```node stegIt-cli hide <ruta_imagen>``` que pediría la introducción del mensaje por teclado.
  * Está disponible también la opción de leer el mensaje de un fichero utilizando el comando ```node stegIt-cli hide --file <ruta_fichero> <ruta_imagen>```.
  * La imagen resultante se guardará en la misma ruta que la original con "hacked" al final del nombre.
  * Por defecto se utilizará de tasa de bits 4 por cada componente rgb. Se puede cambiar con la opción ```--bits``` de ```hide```.

  #### Revelar mensaje
  * Para extraer un mensaje oculto en una imagen, se ejecutará el comando ```node stegIt-cli reveal <ruta_imagen>``` 
    donde ruta_imagen corresponde a la de la imagen con el mensaje oculto.
  * Por defecto se utilizará de tasa de bits 4 por cada componente rgb. Se puede cambiar con la opción ```--bits``` de ```reveal```.

### Créditos.
  Esta aplicación usa librerías externas Open Source. A continuación se muestra la dirección del código fuente de las mismas junto con sus licencias.

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