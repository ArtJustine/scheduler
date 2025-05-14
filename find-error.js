const fs = require("fs")
const path = require("path")

// The problematic number
const problematicNumber = "0.1873987296766962"
const problematicNumberAlt = ".1873987296766962"

// Function to search for the number in a file
function searchFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8")
    if (content.includes(problematicNumber) || content.includes(problematicNumberAlt)) {
      console.log(`Found in ${filePath}`)

      // Find the line number
      const lines = content.split("\n")
      lines.forEach((line, index) => {
        if (line.includes(problematicNumber) || line.includes(problematicNumberAlt)) {
          console.log(`Line ${index + 1}: ${line.trim()}`)
        }
      })
    }
  } catch (err) {
    console.error(`Error reading ${filePath}: ${err.message}`)
  }
}

// Function to recursively search directories
function searchDirectory(dir) {
  const files = fs.readdirSync(dir)

  files.forEach((file) => {
    const filePath = path.join(dir, file)
    const stats = fs.statSync(filePath)

    if (stats.isDirectory()) {
      searchDirectory(filePath)
    } else if (
      stats.isFile() &&
      (filePath.endsWith(".js") ||
        filePath.endsWith(".jsx") ||
        filePath.endsWith(".ts") ||
        filePath.endsWith(".tsx") ||
        filePath.endsWith(".css"))
    ) {
      searchFile(filePath)
    }
  })
}

// Start the search
console.log("Searching for problematic number...")
searchDirectory(".")
console.log("Search complete.")
