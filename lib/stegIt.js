//--- REQUIRES ---
const Jimp = require("jimp"),
    NumberConverter = require("number-converter").NumberConverter,
    Bitwise = require('bitwise'),
    ConvertString = require("convert-string"),
    fs = require('fs'),
    prompt = require('prompt');

/* Get file contents as a String */
let file_to_string = (path_file) => {
    return fs.readFileSync(path_file, "utf8");
}

/* Function that converts a String message to a matrix of bits */
let message_to_bits_matrix = (message) => {
    let nc_dec_to_bin = new NumberConverter(NumberConverter.DECIMAL, NumberConverter.BINARY);
    let array_bits = Array();
    let bits_matrix = Array();

    // Conversion of the message to a list of bytes (ascii)
    message = ConvertString.stringToBytes(message);

    // Loop create a matrix of bits from the list of ascii bytes
    for (let index = 0, len = message.length; index < len; ++index) {
        array_bits.push(nc_dec_to_bin.convert(message[index]));
    }

    // Convert the array of string bits to a bits matrix
    array_bits
        .forEach(function (element) {
            bits_matrix.push(Bitwise.toBits(element));
        });

    return bits_matrix;
}

/* Function that normalizes a matrix of bits to 8 bits elements (add zeros at the beginning)*/
let normalize_bits_matrix = (bits_matrix) => {
    bits_matrix
        .forEach(function (element) {
            if (element.length < 8) {
                let zeros_to_fill = 8 - element.length;
                for (let index = 0, len = zeros_to_fill; index < zeros_to_fill; index++) {
                    element.unshift(0);
                }
            }
        }, this);
    return bits_matrix;
}

/* Function that unpacks a bits matrix to an array of bits*/
let unpack_bits_matrix = (bits_matrix) => {
    let array_unpacked = Array();
    bits_matrix.forEach(function (element) {
        element
            .forEach(function (element) {
                array_unpacked.push(element);
            }, this);
    }, this);

    return array_unpacked;
}

/* Function that packs an array of bits to a bits matrix*/
let pack_array_bits = (array_bits) => {
    let bits_matrix = Array();
    for (let index_byte = 0, len_byte = (array_bits.length / 8); index_byte < len_byte; index_byte++) {
        let array_byte = Array();
        for (let index_bit = 0, len_bit = 8; index_bit < len_bit; index_bit++) {
            array_byte.push(array_bits[(8 * index_byte) + index_bit]);
        }
        bits_matrix.push(array_byte);
    }

    return bits_matrix;
}

/* Function that converts a bit matrix to a String message */
let bits_matrix_to_message = (bits_matrix) => {
    let nc_dec_to_bin = new NumberConverter(NumberConverter.DECIMAL, NumberConverter.BINARY);
    let message = String();

    bits_matrix.forEach(function (element) {
        message = message.concat(String.fromCharCode(Bitwise.writeByte(element)));
        //console.log(String.fromCharCode(Bitwise.writeByte(element)));
    }, this);

    return message;
}

/* Function that returns the number of available bits to encode a message in the image */
let get_available_bits = (image) => {
    // height * width * rgba components * bits per component
    let available_bits = (image.bitmap.height * image.bitmap.width * 4 * 4);

    return available_bits;
}

/* Function that puts a String message in the indicated pixels of an image*/
let put_message_bits_in_pixels = (message, image, image_hacked_name = "image_hacked.png") => {
    let image_hacked = image;
    let length_message = message.length;
    let width_needed_to_code = Math.ceil(length_message / (image.bitmap.width * 4 * 4));
    let index_message = 0;

    // Image rows's loop
    for (var index_row = 0, width = width_needed_to_code; index_row < width; index_row++) {
        // Image columns's loop
        for (var index_col = 0, height = image.bitmap.height; index_col < height; index_col++) {
            // console.log("\n---Column " + index_col + "---"); Retrieval of the actual
            // pixel rgba components
            let r_component = Bitwise.readByte(Jimp.intToRGBA(image.getPixelColor(index_row, index_col))["r"]);
            let g_component = Bitwise.readByte(Jimp.intToRGBA(image.getPixelColor(index_row, index_col))["g"]);
            let b_component = Bitwise.readByte(Jimp.intToRGBA(image.getPixelColor(index_row, index_col))["b"]);
            let a_component = Bitwise.readByte(Jimp.intToRGBA(image.getPixelColor(index_row, index_col))["a"]);

            // Insertion of the bits in the rgba components
            [r_component, g_component, b_component, a_component].every(function (component) {
                // console.log("Initial State Component: " + component); Loop of LSB replace for
                // each component
                for (var index_local = 4, len_local = 8; index_local < len_local; index_local++) {
                    component[index_local] = message[index_message];
                    //console.log(index_message);
                    index_message = index_message + 1;
                    if (index_message >= message.length) 
                        break;
                    }
                // console.log("Final State Component: " + component + "\n"); End-condition
                // every iterator
                if (index_message >= message.length) {
                    return false;
                } else {
                    return true;
                }
            });

            // Insertion of changed rgba components in the modified image
            image_hacked.setPixelColor(Jimp.rgbaToInt(Bitwise.writeByte(r_component), Bitwise.writeByte(g_component), Bitwise.writeByte(b_component), Bitwise.writeByte(a_component)), index_row, index_col);

            // Break condition for reach of the message's end
            if (index_message >= message.length) 
                break;

            }
        //console.log(" "); Break condition for reach of the message's end
        if (index_message >= message.length) 
            break;
        }
    var image_hacked_name = image_hacked_name;

    // Write the modified image to disk
    image_hacked.write(image_hacked_name);
    console.log("The message has been hided in " + image_hacked_name);

    return image_hacked;
}

/* Function that gets a String message from the indicated pixels of an image */
let get_message_from_pixels = (image, length_message) => {
    let recovered_message = [];
    let index_message = 0;
    let width_needed_to_code = Math.ceil(length_message / (image.bitmap.width * 4 * 4));

    for (var index_row = 0, width = width_needed_to_code; index_row < width; index_row++) {
        for (var index_col = 0, height = image.bitmap.height; index_col < height; index_col++) {
            //console.log("\n---Column " + index_col + "---");
            ["r", "g", "b", "a"]
                .every(function (component_selector) {
                    let component = Bitwise.readByte(Jimp.intToRGBA(image.getPixelColor(index_row, index_col))[component_selector]);
                    // console.log("\nComponent: " + component_selector); console.log("Initial State
                    // Component: " + component); Loop of LSB replace for each component
                    for (var index_local = 4, len_local = 8; index_local < len_local; index_local++) {
                        recovered_message.push(component[index_local]);
                        //console.log(index_message);
                        index_message = index_message + 1;
                        if (index_message >= length_message) 
                            break;
                        }
                    // console.log("Final State Component: " + component); End-condition every
                    // iterator
                    if (index_message >= length_message) {
                        return false;
                    } else {
                        return true;
                    }
                });

            // Break condition for reach of the message's end
            if (index_message >= length_message) 
                break;

            }
        //console.log(" "); Break condition for reach of the message's end
        if (index_message >= length_message) 
            break;
        }
    //console.log(recovered_message);
    let message_final = bits_matrix_to_message(pack_array_bits(recovered_message));

    return message_final;
}

/* Function that shows misc information about the steganography process */
let show_process_data = (image, message) => {
    console.log("-- Size of the message bits = " + message.length);
    console.log("-- Available bits in the image = " + get_available_bits(image) + "\n");
}

/* Function that return a Promise that shows a prompt to the user and get a String message from him */
let get_message_from_prompt = () => {
    return new Promise(function (resolve, reject) {
        var schema_prompt = {
            properties: {
                message: {
                    description: 'Enter your message', // Prompt displayed to the user
                    type: 'string', // Type of input to expect
                    required: true // Value entered must be non-empty
                }
            }
        };
        prompt.start();
        prompt.get(schema_prompt, function (err, result) {
            resolve(result.message);
        });
    });
}

/* */
let hiding_process = (message_string, image, path_image) => {
    console.log("-- Original message => " + message_string);
    console.log("\n");
    let bits_matrix = message_to_bits_matrix(message_string);
    let bits_matrix_normalized = normalize_bits_matrix(bits_matrix);
    let array_bits_unpacked = unpack_bits_matrix(bits_matrix_normalized);

    // Hiding test
    let message = array_bits_unpacked;
    show_process_data(image, message);
    let image_hacked_name = path_image.split(".")[0] + "_hacked." + image
        ._originalMime
        .split("/")[1];
    let image_hacked = put_message_bits_in_pixels(message, image, image_hacked_name);
}

/* Function that hides a message into an image */
exports.hide = (path_image, options) => {
    Jimp
    // Load the image with Promise
        .read(path_image)
        .then(function (image) {
            // Get the message from prompt
            if (options.mode === "screen") {
                get_message_from_prompt()
                    .then(function (message_string) {
                        hiding_process(message_string, image, path_image);
                    });
                // Get the message from file
            } else if (options.mode === "file") {
                if (options.file) {
                    let message_string = fs.readFileSync(options.file, "utf8");
                    hiding_process(message_string, image, path_image);
                }
            }
        })
        .catch(function (err) {
            console.log(err);
        });

};

/* Function that reveals a message hided in an image */
exports.reveal = (path_image, message_length) => {
    Jimp
    // Load the image with Promise
        .read(path_image)
        .then(function (image) {

            // Message recovering
            let message_recuperado = get_message_from_pixels(image, message_length);
            console.log("-- Mensaje recuperado => " + message_recuperado);

        })
        .catch(function (err) {
            console.log(err);
        });

};

/* Function that hide and reveals a message into an image showing the process */
exports.test = (path_image) => {
    Jimp
    // Load the image with Promise
        .read(path_image)
        .then(function (image) {
            // Test end-to-end hide/reveal of message
            let message_string = "ÉRASE UNA VEZ UNA HISTORIA MUY LARGA Y PARA LA QUE VAN A HACER FALTA UNOS CUANTO" +
                    "S BITS";
            console.log("-- Original message => " + message_string);
            console.log("\n");
            let bits_matrix = message_to_bits_matrix(message_string);
            console.log("-- Matriz de bits no normalizada");
            console.log(bits_matrix);
            console.log("\n");
            let bits_matrix_normalized = normalize_bits_matrix(bits_matrix);
            console.log("-- Matriz de bits normalizada");
            console.log(bits_matrix_normalized);
            console.log("\n");
            let array_bits_unpacked = unpack_bits_matrix(bits_matrix_normalized);
            console.log("-- Array de bits");
            console.log(array_bits_unpacked);
            console.log("\n");

            // Hide
            console.log("--- HIDING MESSAGE\n");
            let message = array_bits_unpacked;
            show_process_data(image, message);
            let image_hacked_name = path_image.split(".")[0] + "_hacked." + image
                ._originalMime
                .split("/")[1];
            let image_hacked = put_message_bits_in_pixels(message, image, image_hacked_name);

            // Reveal
            console.log("--- REVEALING MESSAGE\n");
            let message_recuperado = get_message_from_pixels(image_hacked, message.length);
            console.log("-- Mensaje recuperado => " + message_recuperado);

        })
        .catch(function (err) {
            console.log(err);
        });

}