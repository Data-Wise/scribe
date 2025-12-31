/**
 * Academic features: BibTeX parsing and Pandoc export
 */

use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::Path;
use std::process::Command;

/// Citation from BibTeX
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Citation {
    pub key: String,
    pub title: String,
    pub authors: Vec<String>,
    pub year: u16,
    pub journal: Option<String>,
    pub doi: Option<String>,
}

/// Export format
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ExportFormat {
    Pdf,
    Docx,
    Latex,
    Html,
}

/// Export options
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExportOptions {
    pub note_id: String,
    pub content: String,
    pub title: String,
    pub format: ExportFormat,
    pub bibliography: Option<String>,
    pub csl: String,
    pub include_metadata: bool,
    pub process_equations: bool,
}

/// Export result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExportResult {
    pub path: String,
    pub success: bool,
}

/// Parse a BibTeX file and return citations
pub fn parse_bibtex(content: &str) -> Vec<Citation> {
    let mut citations = Vec::new();
    let mut current_entry: Option<HashMap<String, String>> = None;
    let mut current_key = String::new();
    let mut in_entry = false;
    let mut brace_depth = 0;
    let mut current_field = String::new();
    let mut current_value = String::new();
    let mut in_value = false;

    for line in content.lines() {
        let line = line.trim();

        // Start of entry: @article{key,
        if line.starts_with('@') && !in_entry {
            if let Some(start) = line.find('{') {
                if let Some(end) = line.find(',') {
                    current_key = line[start + 1..end].trim().to_string();
                    current_entry = Some(HashMap::new());
                    in_entry = true;
                    brace_depth = 1;
                } else if line.ends_with('{') {
                    // Entry continues on next line
                    current_key = line[start + 1..].trim().trim_end_matches('{').to_string();
                    current_entry = Some(HashMap::new());
                    in_entry = true;
                    brace_depth = 1;
                }
            }
            continue;
        }

        if in_entry {
            // Count braces
            for c in line.chars() {
                match c {
                    '{' => brace_depth += 1,
                    '}' => brace_depth -= 1,
                    _ => {}
                }
            }

            // End of entry
            if brace_depth == 0 {
                if let Some(entry) = current_entry.take() {
                    if let Some(citation) = entry_to_citation(&current_key, &entry) {
                        citations.push(citation);
                    }
                }
                in_entry = false;
                current_field.clear();
                current_value.clear();
                in_value = false;
                continue;
            }

            // Parse field = {value} or field = "value"
            if let Some(eq_pos) = line.find('=') {
                if !in_value {
                    current_field = line[..eq_pos].trim().to_lowercase();
                    let rest = line[eq_pos + 1..].trim();

                    // Extract value
                    if rest.starts_with('{') || rest.starts_with('"') {
                        let delim = if rest.starts_with('{') { ('{', '}') } else { ('"', '"') };
                        if let Some(end) = rest[1..].find(delim.1) {
                            current_value = rest[1..end + 1].to_string();
                            if let Some(entry) = current_entry.as_mut() {
                                entry.insert(current_field.clone(), current_value.clone());
                            }
                            current_field.clear();
                            current_value.clear();
                        } else {
                            // Multi-line value
                            current_value = rest[1..].to_string();
                            in_value = true;
                        }
                    }
                }
            } else if in_value {
                // Continue multi-line value
                if line.contains('}') || line.contains('"') {
                    if let Some(end) = line.find(|c| c == '}' || c == '"') {
                        current_value.push_str(&line[..end]);
                        if let Some(entry) = current_entry.as_mut() {
                            entry.insert(current_field.clone(), current_value.clone());
                        }
                        current_field.clear();
                        current_value.clear();
                        in_value = false;
                    }
                } else {
                    current_value.push(' ');
                    current_value.push_str(line);
                }
            }
        }
    }

    citations
}

/// Convert BibTeX entry to Citation
fn entry_to_citation(key: &str, entry: &HashMap<String, String>) -> Option<Citation> {
    let title = entry.get("title").cloned().unwrap_or_default();
    if title.is_empty() {
        return None;
    }

    let authors = parse_authors(entry.get("author").map(|s| s.as_str()).unwrap_or(""));
    let year = entry
        .get("year")
        .and_then(|y| y.parse().ok())
        .unwrap_or(0);

    Some(Citation {
        key: key.to_string(),
        title,
        authors,
        year,
        journal: entry.get("journal").cloned(),
        doi: entry.get("doi").cloned(),
    })
}

/// Parse BibTeX author field
fn parse_authors(author_str: &str) -> Vec<String> {
    if author_str.is_empty() {
        return vec![];
    }

    author_str
        .split(" and ")
        .map(|a| {
            let a = a.trim();
            // Handle "Last, First" format
            if let Some(comma) = a.find(',') {
                a[..comma].trim().to_string()
            } else {
                // Handle "First Last" format - take last word
                a.split_whitespace().last().unwrap_or(a).to_string()
            }
        })
        .collect()
}

/// Read bibliography from file
pub fn read_bibliography(path: &Path) -> Result<Vec<Citation>, String> {
    let content = fs::read_to_string(path)
        .map_err(|e| format!("Failed to read bibliography: {}", e))?;
    Ok(parse_bibtex(&content))
}

/// Search citations by query
pub fn search_citations(citations: &[Citation], query: &str) -> Vec<Citation> {
    let query_lower = query.to_lowercase();
    citations
        .iter()
        .filter(|c| {
            c.key.to_lowercase().contains(&query_lower)
                || c.title.to_lowercase().contains(&query_lower)
                || c.authors.iter().any(|a| a.to_lowercase().contains(&query_lower))
        })
        .cloned()
        .collect()
}

/// Check if Pandoc is available
pub fn is_pandoc_available() -> bool {
    Command::new("pandoc")
        .arg("--version")
        .output()
        .map(|o| o.status.success())
        .unwrap_or(false)
}

/// Export document using Pandoc
pub fn export_document(options: &ExportOptions, output_dir: &Path) -> Result<ExportResult, String> {
    if !is_pandoc_available() {
        return Err("Pandoc is not installed. Install with: brew install pandoc".to_string());
    }

    // Create temp input file
    let input_path = output_dir.join("_export_temp.md");
    let mut content = String::new();

    // Add YAML frontmatter if requested
    if options.include_metadata {
        content.push_str("---\n");
        content.push_str(&format!("title: \"{}\"\n", options.title.replace('"', "\\\"")));
        content.push_str("---\n\n");
    }

    content.push_str(&options.content);

    fs::write(&input_path, &content)
        .map_err(|e| format!("Failed to write temp file: {}", e))?;

    // Determine output extension
    let ext = match options.format {
        ExportFormat::Pdf => "pdf",
        ExportFormat::Docx => "docx",
        ExportFormat::Latex => "tex",
        ExportFormat::Html => "html",
    };

    let safe_title = options.title.replace(['/', '\\', ':', '*', '?', '"', '<', '>', '|'], "_");
    let output_path = output_dir.join(format!("{}.{}", safe_title, ext));

    // Build Pandoc command
    let mut cmd = Command::new("pandoc");
    cmd.arg(&input_path)
        .arg("-o")
        .arg(&output_path)
        .arg("--standalone");

    // Add bibliography if provided
    if let Some(bib_path) = &options.bibliography {
        if !bib_path.is_empty() {
            cmd.arg("--citeproc")
                .arg(format!("--bibliography={}", bib_path));

            // Add CSL if not default
            if options.csl != "apa" {
                cmd.arg(format!("--csl={}.csl", options.csl));
            }
        }
    }

    // For PDF, use xelatex for better font support
    if matches!(options.format, ExportFormat::Pdf) {
        cmd.arg("--pdf-engine=xelatex");
    }

    let output = cmd.output()
        .map_err(|e| format!("Failed to run Pandoc: {}", e))?;

    // Clean up temp file
    let _ = fs::remove_file(&input_path);

    if output.status.success() {
        Ok(ExportResult {
            path: output_path.to_string_lossy().to_string(),
            success: true,
        })
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        Err(format!("Pandoc failed: {}", stderr))
    }
}

/// LaTeX compilation result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LatexCompileResult {
    pub success: bool,
    pub pdf_path: Option<String>,
    pub errors: Vec<LatexError>,
    pub warnings: Vec<String>,
    pub log_path: String,
}

/// LaTeX compilation error
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LatexError {
    pub line: Option<u32>,
    pub message: String,
    pub file: Option<String>,
}

/// LaTeX compilation options
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LatexCompileOptions {
    pub content: String,
    pub file_path: String,
    pub engine: String,  // "pdflatex" or "xelatex"
}

/// Check if LaTeX is available
pub fn is_latex_available(engine: &str) -> bool {
    Command::new(engine)
        .arg("--version")
        .output()
        .map(|o| o.status.success())
        .unwrap_or(false)
}

/// Parse LaTeX log file for errors and warnings
fn parse_latex_log(log_content: &str) -> (Vec<LatexError>, Vec<String>) {
    let mut errors = Vec::new();
    let mut warnings = Vec::new();
    let lines: Vec<&str> = log_content.lines().collect();

    for (i, line) in lines.iter().enumerate() {
        // Error pattern: "! LaTeX Error:" or "! Undefined control sequence."
        if line.starts_with('!') {
            let message = line[1..].trim().to_string();

            // Try to find line number from context
            let mut line_num = None;
            let mut file = None;

            // Look back for file and line info: "l.123 \somecommand"
            for j in (i.saturating_sub(10)..i).rev() {
                if let Some(context_line) = lines.get(j) {
                    if context_line.starts_with("l.") {
                        if let Some(space_pos) = context_line.find(' ') {
                            if let Ok(num) = context_line[2..space_pos].parse::<u32>() {
                                line_num = Some(num);
                                break;
                            }
                        }
                    }
                    // File pattern: "(./filename.tex"
                    if context_line.contains("(./") {
                        if let Some(start) = context_line.find("(./") {
                            if let Some(end) = context_line[start..].find(' ') {
                                file = Some(context_line[start+3..start+end].to_string());
                            }
                        }
                    }
                }
            }

            errors.push(LatexError {
                line: line_num,
                message,
                file,
            });
        }

        // Warning pattern: "LaTeX Warning:"
        if line.contains("LaTeX Warning:") || line.contains("Package") && line.contains("Warning:") {
            warnings.push(line.trim().to_string());
        }
    }

    (errors, warnings)
}

/// Compile LaTeX document to PDF
pub fn compile_latex(options: &LatexCompileOptions, work_dir: &Path) -> Result<LatexCompileResult, String> {
    // Validate engine
    if options.engine != "pdflatex" && options.engine != "xelatex" {
        return Err(format!("Unknown LaTeX engine: {}. Use 'pdflatex' or 'xelatex'", options.engine));
    }

    // Check if LaTeX is available
    if !is_latex_available(&options.engine) {
        return Err(format!(
            "{} is not installed. Install TeX Live or MacTeX from: https://www.tug.org/texlive/",
            options.engine
        ));
    }

    // Write content to .tex file
    let tex_path = Path::new(&options.file_path);
    let tex_filename = tex_path.file_stem()
        .and_then(|s| s.to_str())
        .ok_or("Invalid file path")?;

    let work_tex_path = work_dir.join(format!("{}.tex", tex_filename));
    fs::write(&work_tex_path, &options.content)
        .map_err(|e| format!("Failed to write .tex file: {}", e))?;

    // Run LaTeX compilation
    // Use -interaction=nonstopmode to avoid hanging on errors
    // Use -halt-on-error for cleaner failure behavior
    let _output = Command::new(&options.engine)
        .current_dir(work_dir)
        .arg("-interaction=nonstopmode")
        .arg("-file-line-error")
        .arg(&work_tex_path)
        .output()
        .map_err(|e| format!("Failed to run {}: {}", options.engine, e))?;

    // Read log file
    let log_path = work_dir.join(format!("{}.log", tex_filename));
    let log_content = fs::read_to_string(&log_path)
        .unwrap_or_else(|_| String::from("Log file not found"));

    // Parse errors and warnings
    let (errors, warnings) = parse_latex_log(&log_content);

    // Check if PDF was generated
    let pdf_path = work_dir.join(format!("{}.pdf", tex_filename));
    let success = pdf_path.exists() && errors.is_empty();

    Ok(LatexCompileResult {
        success,
        pdf_path: if pdf_path.exists() {
            Some(pdf_path.to_string_lossy().to_string())
        } else {
            None
        },
        errors,
        warnings,
        log_path: log_path.to_string_lossy().to_string(),
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_bibtex() {
        let bib = r#"
@article{smith2020,
  author = {Smith, John and Doe, Jane},
  title = {A Great Paper},
  journal = {Nature},
  year = {2020},
  doi = {10.1234/example}
}
"#;
        let citations = parse_bibtex(bib);
        assert_eq!(citations.len(), 1);
        assert_eq!(citations[0].key, "smith2020");
        assert_eq!(citations[0].title, "A Great Paper");
        assert_eq!(citations[0].year, 2020);
    }

    #[test]
    fn test_parse_authors() {
        let authors = parse_authors("Smith, John and Doe, Jane and Brown, Bob");
        assert_eq!(authors, vec!["Smith", "Doe", "Brown"]);
    }

    #[test]
    fn test_search_citations() {
        let citations = vec![
            Citation {
                key: "smith2020".to_string(),
                title: "A Great Paper".to_string(),
                authors: vec!["Smith".to_string()],
                year: 2020,
                journal: Some("Nature".to_string()),
                doi: None,
            },
            Citation {
                key: "jones2021".to_string(),
                title: "Another Paper".to_string(),
                authors: vec!["Jones".to_string()],
                year: 2021,
                journal: None,
                doi: None,
            },
        ];

        let results = search_citations(&citations, "smith");
        assert_eq!(results.len(), 1);
        assert_eq!(results[0].key, "smith2020");
    }
}
