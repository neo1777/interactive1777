const obfuscate = (str) => {
    return Buffer.from(str.split("").reverse().join("")).toString('base64');
};
console.log("BOT_TOKEN:", obfuscate("8734809607:AAEEUTV-TS83qGV0Vf_zVD2fxb5GoCgPaS0"));
console.log("CHAT_ID:", obfuscate("774881727"));
