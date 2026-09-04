import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import dns from 'dns';

try {
  if (typeof dns.setDefaultResultOrder === 'function') {
    dns.setDefaultResultOrder('ipv4first');
  }
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {}

// Read .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...rest] = line.split('=');
  if (key && rest.length) {
    envVars[key.trim()] = rest.join('=').trim();
  }
});

const uri = envVars.MONGODB_URI || process.env.MONGODB_URI;

async function resolveDirectUriIfSrvFails(srvUri) {
  if (!srvUri || !srvUri.startsWith('mongodb+srv://')) return srvUri;
  try {
    const match = srvUri.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^/?]+)\/?([^?]*)/);
    if (match) {
      const [, user, pass, host, db] = match;
      const resolver = new dns.promises.Resolver();
      resolver.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
      const addresses = await resolver.resolveSrv(`_mongodb._tcp.${host}`);
      if (addresses && addresses.length > 0) {
        const hostList = addresses.map((a) => `${a.name}:${a.port}`).join(',');
        const dbName = db || 'qarp_elearning';
        return `mongodb://${user}:${pass}@${hostList}/${dbName}?ssl=true&authSource=admin&retryWrites=true&w=majority`;
      }
    }
  } catch (err) {
    console.warn('[MongoDB] Custom SRV resolution fallback error:', err.message);
  }
  return srvUri;
}

async function connectDB() {
  try {
    return await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  } catch (err) {
    console.log(`Primary connection failed (${err.message}). Trying SRV fallback resolver...`);
    const fallbackUri = await resolveDirectUriIfSrvFails(uri);
    return await mongoose.connect(fallbackUri, { serverSelectionTimeoutMS: 10000 });
  }
}

async function testNotesCRUD() {
  console.log('Connecting to MongoDB...');
  await connectDB();
  console.log('✓ Connected successfully to MongoDB!');

  const db = mongoose.connection.db;
  const notesCollection = db.collection('meetingnotes');
  const countBefore = await notesCollection.countDocuments();
  console.log(`Current meetingnotes count in DB: ${countBefore}`);

  // Fetch 3 sample notes from DB
  const samples = await notesCollection.find({}).limit(3).toArray();
  console.log('Sample notes currently in DB:');
  samples.forEach(n => console.log(` - [_id: ${n._id}] "${n.title}" (Module: ${n.module})`));

  // Test 1: Add note via API (BE)
  console.log('\n--- 1. Testing Add Note via BE API (POST http://localhost:3000/api/meeting-notes) ---');
  const testTitle = `DB Test Note - ${Date.now()}`;
  const addRes = await fetch('http://localhost:3000/api/meeting-notes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: testTitle,
      module: 'Main module 1',
      topic: 'Playwright',
      tagColor: 'emerald',
      summary: {
        purpose: 'Automated verification test of add/delete notes flow',
        coverageGoals: ['Verify DB persistence', 'Verify API response'],
      },
    }),
  });

  const addData = await addRes.json();
  console.log('POST Response status:', addRes.status, 'Success:', addData.success);
  if (!addData.success || !addData.note?._id) {
    throw new Error('Failed to add note via BE API: ' + JSON.stringify(addData));
  }
  const createdId = addData.note._id;
  console.log(`✓ Note created via BE API: ID: ${createdId}, Title: "${addData.note.title}"`);

  // Test 2: Verify in DB directly
  console.log('\n--- 2. Verifying Added Note directly in MongoDB ---');
  const foundInDb = await notesCollection.findOne({ _id: new mongoose.Types.ObjectId(createdId) });
  if (!foundInDb) {
    throw new Error('Created note NOT found in MongoDB!');
  }
  console.log(`✓ Direct DB check: Found note in collection with title "${foundInDb.title}"`);

  // Test 3: Delete note via BE API (DELETE http://localhost:3000/api/meeting-notes/[id])
  console.log('\n--- 3. Testing Delete Note via BE API (DELETE http://localhost:3000/api/meeting-notes/[id]) ---');
  const delRes = await fetch(`http://localhost:3000/api/meeting-notes/${createdId}`, {
    method: 'DELETE',
  });
  const delData = await delRes.json();
  console.log('DELETE Response status:', delRes.status, 'Success:', delData.success);
  if (!delData.success) {
    throw new Error('Failed to delete note via BE API: ' + JSON.stringify(delData));
  }
  console.log('✓ Delete response message:', delData.message);

  // Test 4: Verify deletion directly in MongoDB
  console.log('\n--- 4. Verifying Deletion directly in MongoDB ---');
  const afterDeleteInDb = await notesCollection.findOne({ _id: new mongoose.Types.ObjectId(createdId) });
  if (afterDeleteInDb) {
    throw new Error('Note STILL exists in MongoDB after DELETE!');
  }
  console.log('✓ Direct DB check: Note successfully and permanently removed from MongoDB!');

  const countAfter = await notesCollection.countDocuments();
  console.log(`Final meetingnotes count in DB: ${countAfter} (Matches initial count: ${countBefore === countAfter})`);

  await mongoose.disconnect();
  console.log('\n>>> All BE & DB tests PASSED with 100% verification! <<<');
}

testNotesCRUD().catch(err => {
  console.error('Error during test:', err);
  process.exit(1);
});
