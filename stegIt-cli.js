//--- REQUIRES ---
const program = require('commander')
stegIt = require("./lib/stegIt");

// CLI initialization Sub-command to hide a message into an image
program
    .version("1.0")
    .command('hide <path_image>')
    .option("-m, --mode <mode>", "Source to read the message: 'screen' or 'file'")
    .option("-f, --file <path_file>", "Path of the file to read")
    .option("-b, --bits <bit_rate>", "Bit rate to put the message into the image (between 4 and 1)")
    .description("Hides a message into an image")
    .action(stegIt.hide);

// Sub-command to reveal a message from an image
program
    .command("reveal <path_image>")
    .description("Reveals a message hided in an image")
    .option("-b, --bits <bit_rate>", "Bit rate to put the message into the image (between 4 and 1)")
    .action(stegIt.reveal);

// Sub-command to test the hide-reveal process
program
    .command("test <path_image>")
    .description("Test the process hide/reveal end-to-end")
    .option("-b, --bits <bit_rate>", "Bit rate to put the message into the image (between 4 and 1)")
    .action(stegIt.test);

program.parse(process.argv);

// Show help if no arguments
if (program.args.length === 0) 
    program.help();