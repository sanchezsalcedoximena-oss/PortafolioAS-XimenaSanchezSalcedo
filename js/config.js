// ============================================
// js/config.js — Application Configuration
// ============================================
// Supabase Setup: Replace with your project credentials
// 1. Go to https://supabase.com → create free project
// 2. Settings > API → copy URL + anon key
// ============================================

const SUPABASE_URL = 'https://mpzvrtzjntxloszqruqc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wenZydHpqbnR4bG9zenFydXFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwNDAwNjQsImV4cCI6MjA5MTYxNjA2NH0.fXB29yDu28-c2Q69Z3jvDutENToXrAtrW-kUK-zicdc';

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
            title: 'UNIDAD I: FUNDAMENTOS DE ARQUITECTURA DE SOFTWARE',
            description: 'En esta unidad se tratará el modelo MVC',
            weeks: [
                { number: 1, name: 'CONCEPTO DE ARQUITECTURA DE SOFTWARE' },
                { number: 2, name: 'ESTÁNDARES INTERNACIONALES' },
                { number: 3, name: 'DISEÑO ARQUITECTÓNICO' },
                { number: 4, name: 'CRITERIOS DE CALIDAD' }
            ]
        },
        {
            id: 2,
            title: 'UNIDAD II: PRINCIPIOS Y PATRONES DE DISEÑO',
            description: 'En esta unidad se abordarán los principios SOLID y patrones de diseño',
            weeks: [
                { number: 5, name: 'PRINCIPIOS SOLID' },
                { number: 6, name: 'PATRONES CREACIONALES' },
                { number: 7, name: 'PATRONES ESTRUCTURALES' },
                { number: 8, name: 'PATRONES DE COMPORTAMIENTO' }
            ]
        },
        {
            id: 3,
            title: 'UNIDAD III: ARQUITECTURAS Y MICROSERVICIOS',
            description: 'En esta unidad se trabajará con arquitecturas de software y microservicios',
            weeks: [
                { number: 9, name: 'ARQUITECTURA EN CAPAS' },
                { number: 10, name: 'ARQUITECTURA ORIENTADA A SERVICIOS' },
                { number: 11, name: 'MICROSERVICIOS' },
                { number: 12, name: 'CONTENEDORES Y DESPLIEGUE' }
            ]
        },
        {
            id: 4,
            title: 'UNIDAD IV: PROYECTO FINAL E INTEGRACIÓN',
            description: 'En esta unidad se integrarán todos los conceptos en un proyecto final',
            weeks: [
                { number: 13, name: 'PLANIFICACIÓN DEL PROYECTO' },
                { number: 14, name: 'DESARROLLO E IMPLEMENTACIÓN' },
                { number: 15, name: 'PRUEBAS Y DOCUMENTACIÓN' },
                { number: 16, name: 'PRESENTACIÓN FINAL' }
            ]
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
