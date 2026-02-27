#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';

import admin from 'firebase-admin';

const seedPathArg = process.argv.find((item) => item.startsWith('--seed='));
const serviceAccountArg = process.argv.find((item) => item.startsWith('--service-account='));

const seedPath = resolve(process.cwd(), seedPathArg ? seedPathArg.split('=')[1] : 'data/kumas-seed.json');
const serviceAccountPath = resolve(
  process.cwd(),
  serviceAccountArg ? serviceAccountArg.split('=')[1] : 'service-account.json'
);

const seedRaw = readFileSync(seedPath, 'utf8');
const seed = JSON.parse(seedRaw);

const serviceAccountRaw = readFileSync(serviceAccountPath, 'utf8');
const serviceAccount = JSON.parse(serviceAccountRaw);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function writeCollection(collectionName, docs) {
  const chunkSize = 400;

  for (let index = 0; index < docs.length; index += chunkSize) {
    const chunk = docs.slice(index, index + chunkSize);
    const batch = db.batch();

    for (const doc of chunk) {
      const ref = db.collection(collectionName).doc(doc.id);
      batch.set(ref, doc, { merge: true });
    }

    await batch.commit();
    console.log(`Committed ${collectionName} chunk ${index / chunkSize + 1}`);
  }
}

await writeCollection('categories', seed.categories || []);
await writeCollection('products', seed.products || []);

console.log('Firestore seed completed.');
