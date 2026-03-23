export const parseCSV = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
      
      if (lines.length === 0) {
        reject(new Error("Empty CSV file"));
        return;
      }
      
      const headers = lines[0].split(",").map(h => h.trim());
      const data = [];
      
      for (let i = 1; i < lines.length; i++) {
        const currentLine = lines[i].split(",");
        if (currentLine.length === headers.length) {
          const row = {};
          for (let j = 0; j < headers.length; j++) {
            row[headers[j]] = currentLine[j].trim();
          }
          data.push(row);
        }
      }
      resolve(data);
    };

    reader.onerror = (err) => {
      reject(new Error("Error reading file", err));
    };

    reader.readAsText(file);
  });
};
