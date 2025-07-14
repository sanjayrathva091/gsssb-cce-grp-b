function extractResults(text) {
  const lines = text.split(/\n/g)
  .map(line => line.trim())
  .filter(line =>line.match(/^\d+/));

  return lines.map(line => {
    const parts = line.split(/\s+/).filter(p => p);
    
    if (!parts.length) return null;

    // Extract basic fields
    const srNo = parseInt(parts[0]);
    const rollNo = parts[1];
    const treatedAs = parts[parts.length - 1];
    
    // Combine remaining parts for processing
    const remainingParts = parts.slice(2).join(' ');
    
    // Extract final marks - looks for the last numeric value before treatedAs
    const marksMatch = remainingParts.match(/(\d+\.\d+)/);
    let preMarks = marksMatch ? marksMatch[0] : "0";
    
    // If marks not found in remainingParts, check the end of the string
    if (!marksMatch) {
      const endMarksMatch = parts[parts.length-1].match(/(\d+\.\d+)(?!.*\d)/);
      
      preMarks = endMarksMatch ? endMarksMatch[0] : "0";
    }

    // Extract name, gender and category
    const nameWithMeta = remainingParts.replace(/\d+\.\d+.*$/, '').trim();
    const { fullName, gender, category } = extractNameGenderCategory(nameWithMeta);
    
    // Extract PH and Ex-Serviceman status
    const { ph, exServiceman } = extractSpecialStatus(treatedAs);

    return {
      srNo,
      rollNo,
      fullName: fullName || nameWithMeta, // Fallback to original if empty
      gender,
      category,
      ph,
      exServiceman,
      preMarks,
      mainsMarks: null,
      treatedAs: treatedAs.includes('-') ? treatedAs : "NA"
    };
  }).filter(Boolean);
}

function extractNameGenderCategory(str) {
  if (!str) return { fullName: "MISSING NAME", gender: "MISSING GENDER", category: "MISSING CATEGORY" };
  // Handle cases where name might contain category patterns
  const genderMatch = str.slice(0, 3) === 'Mr.';
  const gender = genderMatch ? 'M':'F';
  
  // Improved category extraction
  const categoryMatch = str.match(/(SEBC|SC|ST|General(\(EWS\))?|\(EWS\))/i);
  const category = categoryMatch ? categoryMatch[0] : 'MISSING CATEGORY';
  
  // Clean the name by removing honorifics and categories
  const fullName = str
    .replace(/(SEBC|SC|ST|[MF]\sGeneral(\(EWS\))?|\(EWS\)|FSC|FST|FSEBC|MSC|MST|MSEBC|YES|NO|\d+\.\d+)/gi, '')
    .trim();

  return { fullName, gender, category };
}

function extractSpecialStatus(str) {
  const phMatch = str.match(/PH(-\w)?/);
  const ph = phMatch ? phMatch[0] : '';
  
  const exServiceman = str.includes('ExS') ? 'Ex-Serviceman' : 
                       str.includes('EXS') ? 'Ex-Serviceman' : '';
  
  return { ph, exServiceman };
}

module.exports = { extractResults };