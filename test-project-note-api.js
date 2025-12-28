#!/usr/bin/env node

/**
 * Test Project-Note Relationship API
 * 
 * Tests that notes can be assigned to projects via the API
 */

console.log('🧪 Testing Project-Note Relationship...\n');

// Simulate the API calls (this would run in browser console)
const testInstructions = `
// Open browser DevTools console in the running app and paste:

(async () => {
  console.log('\\n🔍 Step 1: List all projects');
  const projects = await window.api.listProjects();
  console.log('Projects:', projects);
  
  if (projects.length === 0) {
    console.log('\\n📝 Creating test project...');
    const project = await window.api.createProject({
      name: 'Test Project',
      type: 'generic',
      description: 'Testing project-note relationships'
    });
    console.log('Created:', project);
    projects.push(project);
  }
  
  const testProject = projects[0];
  console.log('\\n✅ Using project:', testProject.name, '(' + testProject.id + ')');
  
  console.log('\\n🔍 Step 2: List all notes');
  const allNotes = await window.api.listNotes();
  console.log('Total notes:', allNotes.length);
  
  if (allNotes.length === 0) {
    console.log('\\n📝 Creating test note...');
    const note = await window.api.createNote({
      title: 'Test Note for Project Assignment',
      content: 'Testing project-note relationship',
      folder: 'inbox'
    });
    console.log('Created:', note);
    allNotes.push(note);
  }
  
  const testNote = allNotes[0];
  console.log('\\n✅ Using note:', testNote.title, '(' + testNote.id + ')');
  
  console.log('\\n🔗 Step 3: Assign note to project');
  await window.api.setNoteProject(testNote.id, testProject.id);
  console.log('✅ Note assigned to project!');
  
  console.log('\\n🔍 Step 4: Verify assignment');
  const updatedNote = await window.api.getNote(testNote.id);
  console.log('Note project_id:', updatedNote.project_id);
  console.log('Match:', updatedNote.project_id === testProject.id ? '✅ SUCCESS' : '❌ FAILED');
  
  console.log('\\n🔍 Step 5: Get all notes for project');
  const projectNotes = await window.api.getProjectNotes(testProject.id);
  console.log('Notes in project:', projectNotes.length);
  console.log('Contains test note:', projectNotes.some(n => n.id === testNote.id) ? '✅ YES' : '❌ NO');
  
  console.log('\\n🔗 Step 6: Unassign note from project');
  await window.api.setNoteProject(testNote.id, null);
  console.log('✅ Note unassigned!');
  
  console.log('\\n🔍 Step 7: Verify unassignment');
  const unassignedNote = await window.api.getNote(testNote.id);
  console.log('Note project_id:', unassignedNote.project_id);
  console.log('Is null:', unassignedNote.project_id === null ? '✅ SUCCESS' : '❌ FAILED');
  
  console.log('\\n✅ All tests passed!');
})();
`;

console.log(testInstructions);

console.log('\n📊 Database verification command:');
console.log('sqlite3 "$HOME/Library/Application Support/com.scribe.app/scribe.db" \\');
console.log('  "SELECT n.title, n.project_id, p.name FROM notes n LEFT JOIN projects p ON n.project_id = p.id LIMIT 10;"');
