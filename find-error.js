const fs = require("fs")
const path = require("path")

// The problematic number pattern
const pattern = /0\.1873987296766962/

// Function to recursively search directories
function searchFiles(dir) {
  const files = fs.readdirSync(dir)

  for (const file of files) {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) {
      // Skip node_modules and .next directories
      if (file !== "node_modules" && file !== ".next") {
        searchFiles(filePath)
      }
    } else if (
      stat.isFile() &&
      (file.endsWith(".js") ||
        file.endsWith(".jsx") ||
        file.endsWith(".ts") ||
        file.endsWith(".tsx") ||
        file.endsWith(".css"))
    ) {
      try {
        const content = fs.readFileSync(filePath, "utf8")
        if (pattern.test(content)) {
          console.log(`Found pattern in: ${filePath}`)

          // Print the context around the match
          const lines = content.split("\n")
          for (let i = 0; i < lines.length; i++) {
            if (pattern.test(lines[i])) {
              console.log(`Line ${i + 1}: ${lines[i]}`)
            }
          }
        }
      } catch (err) {
        console.error(`Error reading ${filePath}: ${err.message}`)
      }
    }
  }
}

// Start searching from the current directory
searchFiles(".")
