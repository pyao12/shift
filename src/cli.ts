import data from "../deno.json" with { type: "json" };

function showHelp() {
    console.log();
    console.log("Shift CLI Version ", data.version);
    console.log("Deno runtime Version ", Deno.version);
    console.log();
    console.log("Available commands:");
    console.log(" demo    Print Hello world.");
    console.log();
    console.log("Available arguments:");
    console.log(" --help    Show this help page.");
    console.log();
}

function cliMain() {
    const args = Deno.args;
    if (args.length == 0 || args.includes("--help")) { // no arguments, show help
        showHelp();
        return;
    }
    switch (args[0]) {
        case "demo":
            console.log("Hello world");
            break;
        default:
            showHelp();
    }
}

export default cliMain;
