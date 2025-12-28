//! Test Harness for Scribe
//!
//! Provides automated test scenarios that can be triggered from the frontend.
//! Only available in debug builds.

use crate::database::Database;
use serde::{Deserialize, Serialize};
use std::time::Instant;

/// Result of a single test step
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestStep {
    pub name: String,
    pub passed: bool,
    pub message: String,
    pub duration_ms: u64,
}

/// Result of a test scenario
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestResult {
    pub scenario: String,
    pub passed: bool,
    pub steps: Vec<TestStep>,
    pub total_duration_ms: u64,
    pub error: Option<String>,
}

impl TestResult {
    fn new(scenario: &str) -> Self {
        Self {
            scenario: scenario.to_string(),
            passed: true,
            steps: Vec::new(),
            total_duration_ms: 0,
            error: None,
        }
    }

    fn add_step(&mut self, name: &str, passed: bool, message: &str, duration_ms: u64) {
        if !passed {
            self.passed = false;
        }
        self.steps.push(TestStep {
            name: name.to_string(),
            passed,
            message: message.to_string(),
            duration_ms,
        });
    }

    fn fail(&mut self, error: &str) {
        self.passed = false;
        self.error = Some(error.to_string());
    }
}

/// Test runner that executes scenarios against the database
pub struct TestRunner<'a> {
    db: &'a Database,
}

impl<'a> TestRunner<'a> {
    pub fn new(db: &'a Database) -> Self {
        Self { db }
    }

    /// Run a test scenario by name
    pub fn run_scenario(&self, scenario: &str) -> TestResult {
        let start = Instant::now();
        let mut result = match scenario {
            "note_crud" => self.test_note_crud(),
            "note_delete_cycle" => self.test_note_delete_cycle(),
            "project_crud" => self.test_project_crud(),
            "note_project_association" => self.test_note_project_association(),
            "tag_operations" => self.test_tag_operations(),
            "all" => self.test_all(),
            _ => {
                let mut r = TestResult::new(scenario);
                r.fail(&format!("Unknown scenario: {}", scenario));
                r
            }
        };
        result.total_duration_ms = start.elapsed().as_millis() as u64;
        result
    }

    /// List available test scenarios
    pub fn list_scenarios() -> Vec<&'static str> {
        vec![
            "note_crud",
            "note_delete_cycle",
            "project_crud",
            "note_project_association",
            "tag_operations",
            "all",
        ]
    }

    /// Run all test scenarios
    fn test_all(&self) -> TestResult {
        let mut result = TestResult::new("all");
        let scenarios = vec![
            "note_crud",
            "note_delete_cycle",
            "project_crud",
            "note_project_association",
            "tag_operations",
        ];

        for scenario in scenarios {
            let start = Instant::now();
            let sub_result = self.run_scenario(scenario);
            let duration = start.elapsed().as_millis() as u64;

            let passed = sub_result.passed;
            let message = if passed {
                format!("{} steps passed", sub_result.steps.len())
            } else {
                format!(
                    "Failed: {}",
                    sub_result.error.unwrap_or_else(|| "unknown".to_string())
                )
            };

            result.add_step(scenario, passed, &message, duration);
        }

        result
    }

    /// Test basic note CRUD operations
    fn test_note_crud(&self) -> TestResult {
        let mut result = TestResult::new("note_crud");

        // 1. Create note
        let start = Instant::now();
        let note = match self.db.create_note("Test Note CRUD", "Test content", "inbox", None) {
            Ok(n) => {
                result.add_step(
                    "create_note",
                    true,
                    &format!("Created note: {}", n.id),
                    start.elapsed().as_millis() as u64,
                );
                n
            }
            Err(e) => {
                result.add_step(
                    "create_note",
                    false,
                    &format!("Failed: {}", e),
                    start.elapsed().as_millis() as u64,
                );
                return result;
            }
        };

        // 2. Get note
        let start = Instant::now();
        match self.db.get_note(&note.id) {
            Ok(Some(n)) => {
                let matches = n.title == "Test Note CRUD" && n.content == "Test content";
                result.add_step(
                    "get_note",
                    matches,
                    if matches {
                        "Note retrieved correctly"
                    } else {
                        "Note data mismatch"
                    },
                    start.elapsed().as_millis() as u64,
                );
            }
            Ok(None) => {
                result.add_step(
                    "get_note",
                    false,
                    "Note not found",
                    start.elapsed().as_millis() as u64,
                );
            }
            Err(e) => {
                result.add_step(
                    "get_note",
                    false,
                    &format!("Error: {}", e),
                    start.elapsed().as_millis() as u64,
                );
            }
        }

        // 3. Update note
        let start = Instant::now();
        match self.db.update_note(
            &note.id,
            Some("Updated Title"),
            Some("Updated content"),
            None,
            None,
            None,
        ) {
            Ok(Some(n)) => {
                let matches = n.title == "Updated Title" && n.content == "Updated content";
                result.add_step(
                    "update_note",
                    matches,
                    if matches {
                        "Note updated correctly"
                    } else {
                        "Update data mismatch"
                    },
                    start.elapsed().as_millis() as u64,
                );
            }
            Ok(None) => {
                result.add_step(
                    "update_note",
                    false,
                    "Note not found after update",
                    start.elapsed().as_millis() as u64,
                );
            }
            Err(e) => {
                result.add_step(
                    "update_note",
                    false,
                    &format!("Error: {}", e),
                    start.elapsed().as_millis() as u64,
                );
            }
        }

        // 4. Delete note (cleanup)
        let start = Instant::now();
        match self.db.permanent_delete_note(&note.id) {
            Ok(true) => {
                result.add_step(
                    "cleanup",
                    true,
                    "Test note deleted",
                    start.elapsed().as_millis() as u64,
                );
            }
            Ok(false) => {
                result.add_step(
                    "cleanup",
                    false,
                    "Note not found for deletion",
                    start.elapsed().as_millis() as u64,
                );
            }
            Err(e) => {
                result.add_step(
                    "cleanup",
                    false,
                    &format!("Error: {}", e),
                    start.elapsed().as_millis() as u64,
                );
            }
        }

        result
    }

    /// Test the full delete cycle: create → soft delete → restore → permanent delete
    fn test_note_delete_cycle(&self) -> TestResult {
        let mut result = TestResult::new("note_delete_cycle");

        // 1. Create note
        let start = Instant::now();
        let note = match self.db.create_note("Delete Cycle Test", "Content", "inbox", None) {
            Ok(n) => {
                result.add_step(
                    "create",
                    true,
                    &format!("Created: {}", n.id),
                    start.elapsed().as_millis() as u64,
                );
                n
            }
            Err(e) => {
                result.add_step("create", false, &format!("Failed: {}", e), 0);
                return result;
            }
        };

        // 2. Soft delete
        let start = Instant::now();
        match self.db.delete_note(&note.id) {
            Ok(true) => {
                // Verify deleted_at is set
                if let Ok(Some(n)) = self.db.get_note(&note.id) {
                    let has_deleted_at = n.deleted_at.is_some();
                    result.add_step(
                        "soft_delete",
                        has_deleted_at,
                        &if has_deleted_at {
                            format!("deleted_at = {}", n.deleted_at.unwrap())
                        } else {
                            "deleted_at not set!".to_string()
                        },
                        start.elapsed().as_millis() as u64,
                    );
                }
            }
            Ok(false) => {
                result.add_step(
                    "soft_delete",
                    false,
                    "delete_note returned false",
                    start.elapsed().as_millis() as u64,
                );
            }
            Err(e) => {
                result.add_step(
                    "soft_delete",
                    false,
                    &format!("Error: {}", e),
                    start.elapsed().as_millis() as u64,
                );
            }
        }

        // 3. Restore
        let start = Instant::now();
        match self.db.restore_note(&note.id) {
            Ok(Some(n)) => {
                let restored = n.deleted_at.is_none();
                result.add_step(
                    "restore",
                    restored,
                    if restored {
                        "deleted_at = NULL"
                    } else {
                        "deleted_at still set!"
                    },
                    start.elapsed().as_millis() as u64,
                );
            }
            Ok(None) => {
                result.add_step(
                    "restore",
                    false,
                    "Note not found after restore",
                    start.elapsed().as_millis() as u64,
                );
            }
            Err(e) => {
                result.add_step(
                    "restore",
                    false,
                    &format!("Error: {}", e),
                    start.elapsed().as_millis() as u64,
                );
            }
        }

        // 4. Soft delete again
        let start = Instant::now();
        match self.db.delete_note(&note.id) {
            Ok(true) => {
                result.add_step(
                    "soft_delete_2",
                    true,
                    "Second soft delete succeeded",
                    start.elapsed().as_millis() as u64,
                );
            }
            _ => {
                result.add_step(
                    "soft_delete_2",
                    false,
                    "Second soft delete failed",
                    start.elapsed().as_millis() as u64,
                );
            }
        }

        // 5. Permanent delete
        let start = Instant::now();
        match self.db.permanent_delete_note(&note.id) {
            Ok(true) => {
                // Verify note is gone
                if let Ok(None) = self.db.get_note(&note.id) {
                    result.add_step(
                        "permanent_delete",
                        true,
                        "Note permanently deleted",
                        start.elapsed().as_millis() as u64,
                    );
                } else {
                    result.add_step(
                        "permanent_delete",
                        false,
                        "Note still exists after permanent delete!",
                        start.elapsed().as_millis() as u64,
                    );
                }
            }
            Ok(false) => {
                result.add_step(
                    "permanent_delete",
                    false,
                    "permanent_delete_note returned false",
                    start.elapsed().as_millis() as u64,
                );
            }
            Err(e) => {
                result.add_step(
                    "permanent_delete",
                    false,
                    &format!("Error: {}", e),
                    start.elapsed().as_millis() as u64,
                );
            }
        }

        result
    }

    /// Test project CRUD operations
    fn test_project_crud(&self) -> TestResult {
        let mut result = TestResult::new("project_crud");

        // 1. Create project
        let start = Instant::now();
        let project = match self.db.create_project(
            "Test Project",
            Some("Test description"),
            "generic",
            Some("#ff6b6b"),
            None,
        ) {
            Ok(p) => {
                result.add_step(
                    "create_project",
                    true,
                    &format!("Created: {}", p.id),
                    start.elapsed().as_millis() as u64,
                );
                p
            }
            Err(e) => {
                result.add_step("create_project", false, &format!("Failed: {}", e), 0);
                return result;
            }
        };

        // 2. Get project
        let start = Instant::now();
        match self.db.get_project(&project.id) {
            Ok(Some(p)) => {
                let matches = p.name == "Test Project";
                result.add_step(
                    "get_project",
                    matches,
                    if matches {
                        "Project retrieved correctly"
                    } else {
                        "Project data mismatch"
                    },
                    start.elapsed().as_millis() as u64,
                );
            }
            _ => {
                result.add_step(
                    "get_project",
                    false,
                    "Project not found",
                    start.elapsed().as_millis() as u64,
                );
            }
        }

        // 3. Update project
        let start = Instant::now();
        match self.db.update_project(
            &project.id,
            Some("Updated Project"),
            None,
            None,
            None,
            None,
        ) {
            Ok(Some(p)) => {
                let matches = p.name == "Updated Project";
                result.add_step(
                    "update_project",
                    matches,
                    if matches {
                        "Project updated correctly"
                    } else {
                        "Update data mismatch"
                    },
                    start.elapsed().as_millis() as u64,
                );
            }
            _ => {
                result.add_step(
                    "update_project",
                    false,
                    "Update failed",
                    start.elapsed().as_millis() as u64,
                );
            }
        }

        // 4. Delete project (cleanup)
        let start = Instant::now();
        match self.db.delete_project(&project.id) {
            Ok(true) => {
                result.add_step(
                    "cleanup",
                    true,
                    "Project deleted",
                    start.elapsed().as_millis() as u64,
                );
            }
            _ => {
                result.add_step(
                    "cleanup",
                    false,
                    "Cleanup failed",
                    start.elapsed().as_millis() as u64,
                );
            }
        }

        result
    }

    /// Test note-project association
    fn test_note_project_association(&self) -> TestResult {
        let mut result = TestResult::new("note_project_association");

        // 1. Create project
        let start = Instant::now();
        let project = match self.db.create_project("Assoc Test Project", None, "generic", None, None)
        {
            Ok(p) => {
                result.add_step(
                    "create_project",
                    true,
                    &format!("Created project: {}", p.id),
                    start.elapsed().as_millis() as u64,
                );
                p
            }
            Err(e) => {
                result.add_step("create_project", false, &format!("Failed: {}", e), 0);
                return result;
            }
        };

        // 2. Create note with project_id
        let start = Instant::now();
        let note = match self
            .db
            .create_note("Project Note", "Content", "notes", Some(&project.id))
        {
            Ok(n) => {
                let has_project = n.project_id.as_ref() == Some(&project.id);
                result.add_step(
                    "create_note_with_project",
                    has_project,
                    &if has_project {
                        format!("Note has project_id: {}", project.id)
                    } else {
                        "Note missing project_id!".to_string()
                    },
                    start.elapsed().as_millis() as u64,
                );
                n
            }
            Err(e) => {
                result.add_step(
                    "create_note_with_project",
                    false,
                    &format!("Failed: {}", e),
                    0,
                );
                // Cleanup project
                let _ = self.db.delete_project(&project.id);
                return result;
            }
        };

        // 3. Get notes by project
        let start = Instant::now();
        match self.db.get_notes_by_project(&project.id) {
            Ok(notes) => {
                let found = notes.iter().any(|n| n.id == note.id);
                result.add_step(
                    "get_notes_by_project",
                    found,
                    &if found {
                        format!("Found {} notes in project", notes.len())
                    } else {
                        "Note not found in project!".to_string()
                    },
                    start.elapsed().as_millis() as u64,
                );
            }
            Err(e) => {
                result.add_step(
                    "get_notes_by_project",
                    false,
                    &format!("Error: {}", e),
                    start.elapsed().as_millis() as u64,
                );
            }
        }

        // 4. Assign note to different project (none)
        let start = Instant::now();
        match self.db.assign_note_to_project(&note.id, None) {
            Ok(true) => {
                // Verify project_id is now None
                if let Ok(Some(n)) = self.db.get_note(&note.id) {
                    let unassigned = n.project_id.is_none();
                    result.add_step(
                        "unassign_from_project",
                        unassigned,
                        if unassigned {
                            "Note unassigned from project"
                        } else {
                            "Note still has project_id!"
                        },
                        start.elapsed().as_millis() as u64,
                    );
                }
            }
            _ => {
                result.add_step(
                    "unassign_from_project",
                    false,
                    "Unassign failed",
                    start.elapsed().as_millis() as u64,
                );
            }
        }

        // Cleanup
        let _ = self.db.permanent_delete_note(&note.id);
        let _ = self.db.delete_project(&project.id);
        result.add_step("cleanup", true, "Test data cleaned up", 0);

        result
    }

    /// Test tag operations
    fn test_tag_operations(&self) -> TestResult {
        let mut result = TestResult::new("tag_operations");

        // 1. Create note
        let start = Instant::now();
        let note = match self.db.create_note("Tag Test Note", "Content with #test-tag", "inbox", None) {
            Ok(n) => {
                result.add_step(
                    "create_note",
                    true,
                    &format!("Created: {}", n.id),
                    start.elapsed().as_millis() as u64,
                );
                n
            }
            Err(e) => {
                result.add_step("create_note", false, &format!("Failed: {}", e), 0);
                return result;
            }
        };

        // 2. Create tag
        let start = Instant::now();
        let tag = match self.db.create_tag("test-harness-tag", Some("#00ff00")) {
            Ok(t) => {
                result.add_step(
                    "create_tag",
                    true,
                    &format!("Created tag: {}", t.name),
                    start.elapsed().as_millis() as u64,
                );
                t
            }
            Err(e) => {
                result.add_step("create_tag", false, &format!("Failed: {}", e), 0);
                let _ = self.db.permanent_delete_note(&note.id);
                return result;
            }
        };

        // 3. Add tag to note
        let start = Instant::now();
        match self.db.add_tag_to_note(&note.id, &tag.name) {
            Ok(_) => {
                result.add_step(
                    "add_tag_to_note",
                    true,
                    "Tag added to note",
                    start.elapsed().as_millis() as u64,
                );
            }
            Err(e) => {
                result.add_step(
                    "add_tag_to_note",
                    false,
                    &format!("Failed: {}", e),
                    start.elapsed().as_millis() as u64,
                );
            }
        }

        // 4. Get note tags
        let start = Instant::now();
        match self.db.get_note_tags(&note.id) {
            Ok(tags) => {
                let found = tags.iter().any(|t| t.name == tag.name);
                result.add_step(
                    "get_note_tags",
                    found,
                    &if found {
                        format!("Found {} tags on note", tags.len())
                    } else {
                        "Tag not found on note!".to_string()
                    },
                    start.elapsed().as_millis() as u64,
                );
            }
            Err(e) => {
                result.add_step(
                    "get_note_tags",
                    false,
                    &format!("Error: {}", e),
                    start.elapsed().as_millis() as u64,
                );
            }
        }

        // 5. Remove tag from note
        let start = Instant::now();
        match self.db.remove_tag_from_note(&note.id, &tag.id) {
            Ok(_) => {
                result.add_step(
                    "remove_tag_from_note",
                    true,
                    "Tag removed from note",
                    start.elapsed().as_millis() as u64,
                );
            }
            Err(e) => {
                result.add_step(
                    "remove_tag_from_note",
                    false,
                    &format!("Failed: {}", e),
                    start.elapsed().as_millis() as u64,
                );
            }
        }

        // Cleanup
        let _ = self.db.delete_tag(&tag.id);
        let _ = self.db.permanent_delete_note(&note.id);
        result.add_step("cleanup", true, "Test data cleaned up", 0);

        result
    }
}
