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
    }, this);

    return message;
}

/* Function that returns the number of available bits to encode a message in the image */
let get_available_bits = (image, bits_rate=4) => {
    // height * width * rgb components * bits rate per component
    let available_bits = (image.bitmap.height * image.bitmap.width * 3 * bits_rate);

    return available_bits;
}

/* Transform the message size to a bitslist*/
let message_size_to_bits_list = (message_size) => {

    // Transform to bit list the bookmark characters between the size and the message
    let bookmark_bits_matrix = message_to_bits_matrix("%%%");
    let bookmark_bits_matrix_normalized = normalize_bits_matrix(bookmark_bits_matrix);
    let bookmark_array_bits_unpacked = unpack_bits_matrix(bookmark_bits_matrix_normalized);

    // Transform to bit list the message size string
    let string_message_size = new String(message_size);
    let bits_matrix = message_to_bits_matrix(string_message_size);
    let bits_matrix_normalized = normalize_bits_matrix(bits_matrix);
    let array_bits_unpacked = unpack_bits_matrix(bits_matrix_normalized);

    // Concat of the size's bits list with the separator bits list
    array_bits_unpacked = array_bits_unpacked.concat(bookmark_array_bits_unpacked);
    
    return array_bits_unpacked;
}

/* Function that puts a String message in the indicated pixels of an image*/
let put_message_bits_in_pixels = (message, image, image_hacked_name = "image_hacked.png", bits_rate=4) => {
    let image_hacked = image;
    let length_message = message.length;
    let width_needed_to_code = Math.ceil(length_message / (image.bitmap.width * 3 * bits_rate));
    let index_message = 0;

    // Put the size of the message at the start of the image
    let message_size_bit_list = message_size_to_bits_list(message.length);

    // Concat of the size with separator and the message
    message = message_size_bit_list.concat(message);
    
    // Image rows's loop
    for (var index_row = 0, width = width_needed_to_code; index_row < width; index_row++) {
        // Image columns's loop
        for (var index_col = 0, height = image.bitmap.height; index_col < height; index_col++) {
            // Retrieval of the actual pixel rgba components
            let r_component = Bitwise.readByte(Jimp.intToRGBA(image.getPixelColor(index_row, index_col))["r"]);
            let g_component = Bitwise.readByte(Jimp.intToRGBA(image.getPixelColor(index_row, index_col))["g"]);
            let b_component = Bitwise.readByte(Jimp.intToRGBA(image.getPixelColor(index_row, index_col))["b"]);
            let a_component = Bitwise.readByte(Jimp.intToRGBA(image.getPixelColor(index_row, index_col))["a"]);

            // Insertion of the bits in the rgba components
            [r_component, g_component, b_component/*, a_component*/].every(function (component) {
                // Loop of LSB replace for each component (with bit rate)
                for (var index_local = (8-bits_rate), len_local = 8; index_local < len_local; index_local++) {
                    component[index_local] = message[index_message];
                    index_message = index_message + 1;
                    if (index_message >= message.length) 
                        break;
                    }
                // End-condition every iterator
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
    
    // Write the modified image to disk
    image_hacked.write(image_hacked_name);
    console.log("-- The message has been hided in " + image_hacked_name);

    return image_hacked;
}

/* Function that gets a String message from the indicated pixels of an image */
let get_message_from_pixels = (image, length_message, bits_rate = 4, control = 1) => {
    let recovered_message = [];
    let index_message = 0;
    let width_needed_to_code = Math.ceil(length_message / (image.bitmap.width * 3 * bits_rate));
    
    for (var index_row = 0, width = width_needed_to_code; index_row < width; index_row++) {
        for (var index_col = 0, height = image.bitmap.height; index_col < height; index_col++) {
            ["r", "g", "b"/*, "a"*/]
                .every(function (component_selector) {
                    let component = Bitwise.readByte(Jimp.intToRGBA(image.getPixelColor(index_row, index_col))[component_selector]);
                    // Loop of LSB replace for each component
                    for (var index_local = (8-bits_rate), len_local = 8; index_local < len_local; index_local++) {
                        recovered_message.push(component[index_local]);
                        if (control === 1){
                            index_message = index_message + 1;
                        } else {
                            index_message = index_message + 1;
                        }
                        
                        if (index_message >= length_message) 
                            break;
                        }
                    // End-condition every iterator
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
        // Break condition for reach of the message's end
        if (index_message >= length_message) 
            break;
        }

    let message_final = bits_matrix_to_message(pack_array_bits(recovered_message));

    return message_final;
}

/* Function that shows misc information about the steganography process */
let show_process_data = (image, message, bits_rate = 4) => {
    console.log("-- Size of the message in bits = " + message.length);
    console.log("-- Bits rate = "+ bits_rate);
    console.log("-- Available bits in the image = " + get_available_bits(image, bits_rate) + "\n");
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

/* General hiding process*/
let hiding_process = (message_string, image, path_image, bits_rate=4) => {
    console.log("-- Original message => " + message_string);
    let bits_matrix = message_to_bits_matrix(message_string);
    let bits_matrix_normalized = normalize_bits_matrix(bits_matrix);
    let array_bits_unpacked = unpack_bits_matrix(bits_matrix_normalized);
    let message = array_bits_unpacked;
    show_process_data(image, message, bits_rate);
    let image_hacked_name = path_image.split(".")[0] + "_hacked." + image
        ._originalMime
        .split("/")[1];
    let image_hacked = put_message_bits_in_pixels(message, image, image_hacked_name, bits_rate);
}

/* Function that hides a message into an image */
exports.hide = (path_image, options) => {
    Jimp
    // Load the image with Promise
        .read(path_image)
        .then(function (image) {
            // Get the message from prompt
            if (!options.mode || options.mode === "screen") {
                get_message_from_prompt()
                    .then(function (message_string) {
                        let bits_rate = Number(options.bits) || 4;
                        if ((bits_rate>4) || (bits_rate<1)){
                            bits_rate = 4;
                        }
                        
                        if (Number(message_string.length) > Number(get_available_bits(image, bits_rate))) {
                            throw Error("Error: message too big");
                        }
                        hiding_process(message_string, image, path_image, bits_rate);
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
exports.reveal = (path_image, options) => {
    Jimp
    // Load the image with Promise
        .read(path_image)
        .then(function (image) {
            let bits_rate = Number(options.bits) || 4;
            if ((bits_rate>4) || (bits_rate<1)){
                bits_rate = 4;
            }

            // Recover the size of the message from the "header" (beginning of file until %%%)
            let size_message = get_message_from_pixels(image, 64, bits_rate).split("%%%")[0];
            size_message = size_message.replace(/[^0-9]/g, '');
            let length_size_message = Number(size_message.length);
            size_message = Number(size_message);
            
            // Message recovering
            let message_recuperado = get_message_from_pixels(image, ((length_size_message + 3) * 8) + size_message, bits_rate);
            message_recuperado = message_recuperado.split("%%%")[1];
            console.log("-- Mensaje recuperado => " + message_recuperado);

        })
        .catch(function (err) {
            console.log(err);
        });

};

/* Function that hide and reveals a message into an image showing the process */
exports.test = (path_image, options) => {
    Jimp
    // Load the image with Promise
        .read(path_image)
        .then(function (image) {
            // Test end-to-end hide/reveal of message
            let bits_rate = Number(options.bits) || 4;
            let big_message = "aaaaaaaaaa";
            for (let i = 0; i < 19; i++) {
                big_message = big_message + big_message;
            }
            let small_message = "ÉRASE UNA VEZ UNA HISTORIA MUY LARGA Y PARA LA QUE VAN AHACER FALTA UNOS CUANTO" +
                    "S BITS ";

            let message_string = small_message;
            show_process_data(image, message_string, bits_rate);

            if (Number(message_string.length) > Number(get_available_bits(image))) {
                throw Error("Error: message too big");
            }
            console.log("-- Original message => " + message_string);
            console.log("\n");
            let bits_matrix = message_to_bits_matrix(message_string);
            console.log("-- Message's not normalize bits matrix");
            console.log(bits_matrix);
            console.log("\n");
            let bits_matrix_normalized = normalize_bits_matrix(bits_matrix);
            console.log("-- Message's not normalize bits matrix");
            console.log(bits_matrix_normalized);
            console.log("\n");
            let array_bits_unpacked = unpack_bits_matrix(bits_matrix_normalized);
            console.log("-- Bits array");
            console.log(array_bits_unpacked);
            console.log("\n");

            // Hide
            console.log("--- HIDING MESSAGE\n");
            let message = array_bits_unpacked;
            show_process_data(image, message, bits_rate);
            let image_hacked_name = path_image.split(".")[0] + "_hacked." + image
                ._originalMime
                .split("/")[1];
            let image_hacked = put_message_bits_in_pixels(message, image, image_hacked_name, bits_rate);

            // Reveal
            console.log("\n--- REVEALING MESSAGE\n");
           
            // Recover the size of the message from the "header" (beginning of file until %%%)
            let size_message = get_message_from_pixels(image, 64, bits_rate);
            size_message = size_message.replace(/[^0-9]/g, '');
            let length_size_message = Number(size_message.length);
            size_message = Number(size_message);

            // Message recovering
            let message_recuperado = get_message_from_pixels(image_hacked, ((length_size_message + 3) * 8) + size_message, bits_rate);
            message_recuperado = message_recuperado.split("%%%")[1];
            console.log("-- Mensaje recuperado => " + message_recuperado);

        
        })
        .catch(function (err) {
            console.log(err.message);
        });

}