import {onRequest} from 'firebase-functions/v2/https';
import {initializeApp} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore, Timestamp} from 'firebase-admin/firestore';
import {GoogleAuth} from 'google-auth-library';
import {createHandler} from './proxy.js';
initializeApp();
const db = getFirestore(), google = new GoogleAuth({scopes:['https://www.googleapis.com/auth/cloud-platform']});
// ADC uses the runtime service account. No Google TTS key belongs in the web app.
export const chirp = onRequest({region:'europe-west1',maxInstances:2,concurrency:4,timeoutSeconds:30,memory:'256MiB'}, createHandler({db,google,verifyToken:token=>getAuth().verifyIdToken(token,true),Timestamp}));
