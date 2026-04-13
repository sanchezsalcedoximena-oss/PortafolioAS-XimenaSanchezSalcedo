// ============================================
// js/config.js — Application Configuration
// ============================================
// Supabase Setup: Replace with your project credentials
// 1. Go to https://supabase.com → create free project
// 2. Settings > API → copy URL + anon key
// ============================================

const SUPABASE_URL = 'https://mpzvrtzjntxloszqruqc.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_FvFcAX9SV4BpAQblqmi8nQ_QKVaa-UF';

export const APP_CONFIG = Object.freeze({
    supabaseUrl: SUPABASE_URL,
    supabaseAnonKey: SUPABASE_ANON_KEY,
    isSupabaseConfigured: SUPABASE_URL !== '' && SUPABASE_ANON_KEY !== '',

    adminCredentials: {
        email: 'r03409e@upla.edu.pe',
        password: '123888'
    },

    studentName: 'SÁNCHEZ SALCEDO XIMENA ALEXANDRA',

    units: [
        {
            id: 1,
            title: 'UNIDAD I',
            description: 'En esta unidad se tratará el modelo MVC',
            weeks: [1, 2, 3, 4]
        },
        {
            id: 2,
            title: 'UNIDAD II',
            description: 'En esta unidad se abordarán los principios SOLID y patrones de diseño',
            weeks: [5, 6, 7, 8]
        },
        {
            id: 3,
            title: 'UNIDAD III',
            description: 'En esta unidad se trabajará con arquitecturas de software y microservicios',
            weeks: [9, 10, 11, 12]
        },
        {
            id: 4,
            title: 'UNIDAD IV',
            description: 'En esta unidad se integrarán todos los conceptos en un proyecto final',
            weeks: [13, 14, 15, 16]
        }
    ],

    personalBio: 'Soy Sánchez Salcedo Ximena Alexandra, estudiante universitaria cursando la materia de Arquitectura de Software.\nEste portafolio digital recopila todo el material, trabajos y recursos generados durante el desarrollo del curso, organizado por unidades y semanas para facilitar el seguimiento del progreso académico.',

    contact: {
        phone: '954306310',
        email: 'r0409e@ms.upla.edu.pe'
    }
});

// Lazy-loaded Supabase client singleton
let supabaseClient = null;

export async function getSupabaseClient() {
    if (!APP_CONFIG.isSupabaseConfigured) return null;

    if (!supabaseClient) {
        const { createClient } = await import(
            'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'
        );
        supabaseClient = createClient(
            APP_CONFIG.supabaseUrl,
            APP_CONFIG.supabaseAnonKey
        );
    }

    return supabaseClient;
}
