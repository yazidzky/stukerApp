async function test() {
  try {
    console.log("Testing fetch to google.com...");
    const res = await fetch("https://www.google.com");
    console.log("Status:", res.status);
  } catch (err) {
    console.error("Fetch failed:", err);
  }
}

test();
