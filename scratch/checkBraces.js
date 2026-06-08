import fs from "fs";

const content = fs.readFileSync("c:/Users/kyle2/OneDrive/Desktop/LURNEXA PUBLICATIONS/l_p_pro/app/textbooks/portal/page.tsx", "utf8");
const lines = content.split("\n");

let balance = 0;
let stack = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  for (let j = 0; j < line.length; j++) {
    const char = line[j];
    if (char === "{") {
      balance++;
      stack.push({ line: i + 1, col: j + 1 });
    } else if (char === "}") {
      balance--;
      if (balance < 0) {
        console.log(`Extra closing brace } at line ${i + 1}, column ${j + 1}`);
        process.exit(1);
      }
      stack.pop();
    }
  }
}

if (balance > 0) {
  console.log(`Missing ${balance} closing braces. Unclosed braces opened at:`);
  for (const pos of stack.slice(-5)) {
    console.log(`  Line ${pos.line}, Column ${pos.col}: ${lines[pos.line - 1].trim()}`);
  }
} else {
  console.log("Braces are balanced!");
}
