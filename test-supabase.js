// Quick test script to verify Supabase connection
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bifohzgibivvoozjptsa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpZm9oemdpYml2dm9vempwdHNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MTU1MzAsImV4cCI6MjA3NjM5MTUzMH0.fPt4PoQ2p-0dKeLWYVn7jDEbKvtzzZjVW714zYZM6KA';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 Testing Supabase Connection...\n');

// Test 1: Check categories table
console.log('Test 1: Reading categories table...');
const { data: categories, error: catError } = await supabase
  .from('categories')
  .select('*');

if (catError) {
  console.error('❌ Categories Error:', catError.message);
  console.error('Details:', catError);
} else {
  console.log('✅ Categories found:', categories.length);
  console.log('Categories:', categories);
}

// Test 2: Try to insert a test task
console.log('\nTest 2: Inserting test task...');
const { data: newTask, error: taskError } = await supabase
  .from('tasks')
  .insert({
    title: 'Test Task from Script',
    date: new Date().toISOString().split('T')[0],
    priority: 'medium',
    status: 'todo',
    tags: []
  })
  .select()
  .single();

if (taskError) {
  console.error('❌ Task Insert Error:', taskError.message);
  console.error('Details:', taskError);
} else {
  console.log('✅ Task created successfully!');
  console.log('Task:', newTask);
  
  // Clean up - delete the test task
  await supabase.from('tasks').delete().eq('id', newTask.id);
  console.log('✅ Test task cleaned up');
}

console.log('\n📊 Test Complete!');
process.exit(0);

