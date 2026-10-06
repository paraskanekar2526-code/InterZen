require("dotenv").config();

const { sendVerificationOTP } = require("./utils/emailService");

async function test() {
  try {
    const result = await sendVerificationOTP(
      "paraskanekar2526@gmail.com",
      "InterZen Test User",
      "123456"
    );

    console.log("TEST EMAIL SENT SUCCESSFULLY");
    console.log(result.messageId);
  } catch (error) {
    console.error("TEST EMAIL FAILED");
    console.error(error.message);
  }
}

test();