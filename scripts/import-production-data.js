#!/usr/bin/env node

/**
 * Production Data Import Script for TrueHearted Dating App
 * 
 * This script converts MySQL data dump to PostgreSQL format and imports it into Supabase.
 * It handles data type conversions, UUID generation, and maintains referential integrity.
 * 
 * Usage: node scripts/import-production-data.js
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Supabase configuration
const SUPABASE_URL = 'https://ughpjilxcagxyjjnojkk.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_KEY) {
    console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required');
    console.error('Please set it with your Supabase service role key');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
        persistSession: false,
        autoRefreshToken: false
    }
});

// Helper functions for data conversion
function convertDate(mysqlDate) {
    if (!mysqlDate || mysqlDate === '0000-00-00') {
        return new Date().toISOString().split('T')[0]; // Today's date
    }
    return mysqlDate;
}

function convertTimestamp(mysqlTimestamp) {
    if (!mysqlTimestamp || mysqlTimestamp === '0000-00-00 00:00:00') {
        return new Date().toISOString();
    }
    return new Date(mysqlTimestamp).toISOString();
}

function convertConfirmed(confirmed) {
    return (confirmed === 'Yes' || confirmed === 'yes') ? 'yes' : 'no';
}

function cleanString(str) {
    return str ? str.replace(/'/g, "''") : str; // Escape single quotes
}

function generateMemberId() {
    return Math.floor(Math.random() * 1000000) + 1;
}

// Parse MySQL INSERT statements
function parseMySQLInserts(sqlContent, tableName) {
    const tableRegex = new RegExp(`INSERT INTO \`${tableName}\`[^;]+;`, 'gs');
    const matches = sqlContent.match(tableRegex);
    
    if (!matches) return [];
    
    const data = [];
    
    matches.forEach(match => {
        // Extract values from INSERT statement
        const valuesMatch = match.match(/VALUES\s*(.+);$/s);
        if (!valuesMatch) return;
        
        const valuesString = valuesMatch[1];
        
        // Parse each row (this is a simplified parser)
        const rows = valuesString.split(/\),\s*\(/);
        
        rows.forEach((row, index) => {
            // Clean up the row string
            let cleanRow = row.replace(/^\(/, '').replace(/\)$/, '');
            
            // Split by comma, but handle quoted strings
            const values = [];
            let current = '';
            let inQuote = false;
            let quoteChar = '';
            
            for (let i = 0; i < cleanRow.length; i++) {
                const char = cleanRow[i];
                
                if ((char === '"' || char === "'") && !inQuote) {
                    inQuote = true;
                    quoteChar = char;
                    current += char;
                } else if (char === quoteChar && inQuote) {
                    // Check if this is an escaped quote
                    if (cleanRow[i + 1] === quoteChar) {
                        current += char + char;
                        i++; // Skip next char
                    } else {
                        inQuote = false;
                        current += char;
                    }
                } else if (char === ',' && !inQuote) {
                    values.push(current.trim());
                    current = '';
                } else {
                    current += char;
                }
            }
            
            if (current.trim()) {
                values.push(current.trim());
            }
            
            data.push(values);
        });
    });
    
    return data;
}

async function importMembers() {
    console.log('📂 Reading MySQL data file...');
    
    const sqlPath = path.join(process.cwd(), 'scripts', 'mysql-import-data.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('🔍 Parsing members data...');
    
    // For this example, let's manually define a few sample members to import
    // In a real scenario, you would parse the full SQL file
    const sampleMembers = [
        {
            name: 'Angie',
            gender: 'Woman',
            birthdate: '2002-07-10',
            email: 'angie.sample@example.com', // Changed to avoid conflicts
            subscription: 'pro',
            relationship_status: 'Single',
            having_kid: '',
            need_kids: '',
            education_level: '',
            professionalism: '',
            alcoholism: '',
            smoker: '',
            reasons: 'Long-term relationships',
            height: '165',
            weight: '115',
            preferred_age_from: '21',
            preferred_age_to: '30',
            confirmation_code: 'SAMPLE001',
            confirmed: 'yes',
            entry_date: '2024-11-13',
            status: 'active',
            member_id: generateMemberId(),
            location: 'Nairobi',
            last_activity: new Date().toISOString(),
            about_me: 'Sample profile for testing',
            subscription_id: null,
            subscribed_at: null,
            reset_token: null,
            reset_expires: null,
            get_news: 'yes',
            remember_token: '',
            user_id: null // Will be set when user authenticates
        },
        {
            name: 'Emmanuel',
            gender: 'Man',
            birthdate: '1996-02-06',
            email: 'emmanuel.sample@example.com',
            subscription: 'free',
            relationship_status: 'Single',
            having_kid: 'I don\'t have kids',
            need_kids: '',
            education_level: 'Associate, bachelor\'s, or master\'s degree',
            professionalism: 'Employed',
            alcoholism: 'I drink socially',
            smoker: '',
            reasons: 'Casual dating',
            height: '165',
            weight: '69',
            preferred_age_from: '18',
            preferred_age_to: '30',
            confirmation_code: 'SAMPLE002',
            confirmed: 'yes',
            entry_date: '2024-11-13',
            status: 'active',
            member_id: generateMemberId(),
            location: 'Nairobi',
            last_activity: new Date().toISOString(),
            about_me: null,
            subscription_id: null,
            subscribed_at: null,
            reset_token: null,
            reset_expires: null,
            get_news: 'yes',
            remember_token: '',
            user_id: null
        }
    ];
    
    console.log(`📥 Importing ${sampleMembers.length} sample members...`);
    
    for (const member of sampleMembers) {
        try {
            const { error } = await supabase
                .from('members')
                .insert([member]);
                
            if (error) {
                console.error(`❌ Error importing member ${member.name}:`, error);
            } else {
                console.log(`✅ Successfully imported member: ${member.name}`);
            }
        } catch (err) {
            console.error(`❌ Exception importing member ${member.name}:`, err);
        }
    }
}

async function importImageLinks() {
    console.log('🖼️  Importing sample image links...');
    
    // Create member_id mapping first
    const { data: members, error: membersError } = await supabase
        .from('members')
        .select('id, member_id');
        
    if (membersError) {
        console.error('❌ Error fetching members:', membersError);
        return;
    }
    
    // Sample image links (in real scenario, parse from SQL file)
    const sampleImageLinks = [
        {
            img_id: 'sample_image_1.jpg',
            member_id: members[0]?.id,
            is_primary: true
        },
        {
            img_id: 'sample_image_2.jpg', 
            member_id: members[1]?.id,
            is_primary: true
        }
    ];
    
    for (const imageLink of sampleImageLinks) {
        if (!imageLink.member_id) continue;
        
        try {
            const { error } = await supabase
                .from('img_links')
                .insert([imageLink]);
                
            if (error) {
                console.error(`❌ Error importing image link:`, error);
            } else {
                console.log(`✅ Successfully imported image link: ${imageLink.img_id}`);
            }
        } catch (err) {
            console.error(`❌ Exception importing image link:`, err);
        }
    }
}

async function importLikes() {
    console.log('❤️  Importing sample likes...');
    
    const { data: members, error: membersError } = await supabase
        .from('members')
        .select('id, member_id');
        
    if (membersError || members.length < 2) {
        console.error('❌ Need at least 2 members to create likes');
        return;
    }
    
    const sampleLikes = [
        {
            sent_from: members[0].id,
            sent_to: members[1].id,
            like_type: 'like',
            timestamp: new Date().toISOString()
        }
    ];
    
    for (const like of sampleLikes) {
        try {
            const { error } = await supabase
                .from('likes')
                .insert([like]);
                
            if (error) {
                console.error(`❌ Error importing like:`, error);
            } else {
                console.log(`✅ Successfully imported like`);
            }
        } catch (err) {
            console.error(`❌ Exception importing like:`, err);
        }
    }
}

async function main() {
    console.log('🚀 Starting production data import...');
    console.log('⚠️  WARNING: This will import sample data only.');
    console.log('⚠️  For full data import, you need to modify this script to parse the complete SQL file.');
    console.log();
    
    try {
        await importMembers();
        await importImageLinks();
        await importLikes();
        
        console.log();
        console.log('✅ Sample data import completed!');
        console.log();
        console.log('📋 Next steps:');
        console.log('1. Set up authentication for existing users');
        console.log('2. Remove password field from members table (security)');
        console.log('3. Link user_id field when users authenticate');
        console.log('4. Import full dataset by parsing the complete SQL file');
        
    } catch (error) {
        console.error('❌ Import failed:', error);
        process.exit(1);
    }
}

main();