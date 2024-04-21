const { hashPassword, verifyPassword } = require("./core/password");

async function main() {
    const password = "verydifficult";
    const wrongPassword = "verywrong";
    console.log("The password:", password);

    const hash = await hashPassword(password);
    console.log("The hash:", hash);

    let valid = await verifyPassword(password, hash);
    console.log("The password", password, "is", valid ? "valid" : "incorrect");

    valid = await verifyPassword(wrongPassword, hash);
    console.log(
        "The password",
        wrongPassword,
        "is",
        valid ? "valid" : "incorrect"
    );
}

main();
