#!/usr/bin/env node

/**
 * Complete MySQL to PostgreSQL Data Import Script
 * 
 * This script imports the entire MySQL dataset from the uploaded SQL file
 * and converts it to PostgreSQL format for Supabase.
 * 
 * Run: node scripts/complete-data-import.js
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = 'https://ughpjilxcagxyjjnojkk.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_KEY) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable required');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

function parseInsertValues(insertStatement) {
    // Extract the VALUES part
    const valuesMatch = insertStatement.match(/VALUES\s*(.+);?$/si);
    if (!valuesMatch) return [];
    
    let valuesStr = valuesMatch[1].replace(/;$/, '');
    const rows = [];
    let current = '';
    let depth = 0;
    let inString = false;
    let stringChar = '';
    
    for (let i = 0; i < valuesStr.length; i++) {
        const char = valuesStr[i];
        const nextChar = valuesStr[i + 1];
        
        if (!inString) {
            if (char === '(' && depth === 0) {
                current = '';
                depth++;
            } else if (char === ')' && depth === 1) {
                rows.push(parseRowValues(current));
                depth--;
            } else if (char === "'" || char === '"') {
                inString = true;
                stringChar = char;
                current += char;
            } else if (depth === 1) {
                current += char;
            }
        } else {
            current += char;
            if (char === stringChar && nextChar !== stringChar) {
                inString = false;
            } else if (char === stringChar && nextChar === stringChar) {
                current += nextChar;
                i++; // Skip escaped quote
            }
        }
    }
    
    return rows;
}

function parseRowValues(rowStr) {
    const values = [];
    let current = '';
    let inString = false;
    let stringChar = '';
    
    for (let i = 0; i < rowStr.length; i++) {
        const char = rowStr[i];
        const nextChar = rowStr[i + 1];
        
        if (!inString) {
            if (char === "'" || char === '"') {
                inString = true;
                stringChar = char;
                current += char;
            } else if (char === ',' && !inString) {
                values.push(cleanValue(current.trim()));
                current = '';
            } else {
                current += char;
            }
        } else {
            current += char;
            if (char === stringChar && nextChar !== stringChar) {
                inString = false;
            } else if (char === stringChar && nextChar === stringChar) {
                current += nextChar;
                i++;
            }
        }
    }
    
    if (current.trim()) {
        values.push(cleanValue(current.trim()));
    }
    
    return values;
}

function cleanValue(value) {
    if (value === 'NULL' || value === '') return null;
    if (value.startsWith("'") && value.endsWith("'")) {
        return value.slice(1, -1).replace(/''/g, "'");
    }
    if (value.startsWith('"') && value.endsWith('"')) {
        return value.slice(1, -1).replace(/""/g, '"');
    }
    return value;
}

function convertMySQLDate(dateStr) {
    if (!dateStr || dateStr === '0000-00-00') {
        return new Date().toISOString().split('T')[0];
    }
    return dateStr;
}

function convertMySQLTimestamp(timestampStr) {
    if (!timestampStr || timestampStr === '0000-00-00 00:00:00') {
        return new Date().toISOString();
    }
    return new Date(timestampStr).toISOString();
}

async function importMembers(sqlContent) {
    console.log('👥 Processing members data...');
    
    const memberInserts = sqlContent.match(/INSERT INTO `members`[^;]+;/gs);
    if (!memberInserts) {
        console.log('❌ No member data found');
        return;
    }
    
    let totalImported = 0;
    let totalSkipped = 0;
    
    for (const insertStmt of memberInserts) {
        const rows = parseInsertValues(insertStmt);
        
        for (const row of rows) {
            try {
                // Map MySQL columns to PostgreSQL
                const memberData = {
                    name: row[1],
                    gender: row[2],
                    birthdate: convertMySQLDate(row[3]),
                    email: row[4] + '.imported', // Add suffix to avoid conflicts
                    password: row[5], // Will be removed in security migration
                    subscription: row[6] || 'free',
                    relationship_status: row[7],
                    having_kid: row[8],
                    need_kids: row[9],
                    education_level: row[10],
                    professionalism: row[11],
                    alcoholism: row[12],
                    smoker: row[13],
                    reasons: row[14],
                    height: row[15],
                    weight: row[16],
                    preferred_age_from: row[17],
                    preferred_age_to: row[18],
                    confirmation_code: row[19],
                    confirmed: (row[20] === 'Yes' || row[20] === 'yes') ? 'yes' : 'no',
                    entry_date: convertMySQLDate(row[21]),
                    status: row[22] || 'active',
                    member_id: parseInt(row[23]) + 1000000, // Add offset to avoid conflicts
                    location: row[24],
                    last_activity: convertMySQLTimestamp(row[25]),
                    about_me: row[26],
                    subscription_id: row[27],
                    subscribed_at: row[28] ? convertMySQLTimestamp(row[28]) : null,
                    reset_token: row[29],
                    reset_expires: row[30] ? convertMySQLTimestamp(row[30]) : null,
                    get_news: row[31] || 'yes',
                    remember_token: row[32],
                    user_id: null // Set when user authenticates
                };
                
                const { error } = await supabase
                    .from('members')
                    .insert([memberData]);
                
                if (error) {
                    console.log(`⚠️  Skipped member ${memberData.name}: ${error.message}`);
                    totalSkipped++;
                } else {
                    totalImported++;
                    if (totalImported % 10 === 0) {
                        console.log(`✅ Imported ${totalImported} members...`);
                    }
                }
                
            } catch (err) {
                console.error(`❌ Error processing member:`, err.message);
                totalSkipped++;
            }
        }
    }
    
    console.log(`👥 Members import complete: ${totalImported} imported, ${totalSkipped} skipped`);
}

async function importImageLinks(sqlContent) {
    console.log('🖼️  Processing image links...');
    
    const imageInserts = sqlContent.match(/INSERT INTO `img_links`[^;]+;/gs);
    if (!imageInserts) {
        console.log('❌ No image data found');
        return;
    }
    
    // Get member mapping
    const { data: members } = await supabase
        .from('members')
        .select('id, member_id');
    
    const memberMap = new Map(
        members.map(m => [m.member_id - 1000000, m.id]) // Reverse the offset
    );
    
    let totalImported = 0;
    let totalSkipped = 0;
    
    for (const insertStmt of imageInserts) {
        const rows = parseInsertValues(insertStmt);
        
        for (const row of rows) {
            try {
                const originalMemberId = parseInt(row[2]);
                const mappedMemberId = memberMap.get(originalMemberId);
                
                if (!mappedMemberId) {
                    totalSkipped++;
                    continue;
                }
                
                const imageData = {
                    img_id: row[1],
                    member_id: mappedMemberId,
                    is_primary: totalImported === 0 // First image is primary
                };
                
                const { error } = await supabase
                    .from('img_links')
                    .insert([imageData]);
                
                if (error) {
                    totalSkipped++;
                } else {
                    totalImported++;
                }
                
            } catch (err) {
                totalSkipped++;
            }
        }
    }
    
    console.log(`🖼️  Images import complete: ${totalImported} imported, ${totalSkipped} skipped`);
}

async function importLikes(sqlContent) {
    console.log('❤️  Processing likes...');
    
    const likeInserts = sqlContent.match(/INSERT INTO `likes`[^;]+;/gs);
    if (!likeInserts) {
        console.log('❌ No likes data found');
        return;
    }
    
    const { data: members } = await supabase
        .from('members')
        .select('id, member_id');
    
    const memberMap = new Map(
        members.map(m => [m.member_id - 1000000, m.id])
    );
    
    let totalImported = 0;
    let totalSkipped = 0;
    
    for (const insertStmt of likeInserts) {
        const rows = parseInsertValues(insertStmt);
        
        for (const row of rows) {
            try {
                const fromMemberId = memberMap.get(parseInt(row[1]));
                const toMemberId = memberMap.get(parseInt(row[2]));
                
                if (!fromMemberId || !toMemberId) {
                    totalSkipped++;
                    continue;
                }
                
                const likeData = {
                    sent_from: fromMemberId,
                    sent_to: toMemberId,
                    timestamp: convertMySQLTimestamp(row[3]),
                    like_type: 'like'
                };
                
                const { error } = await supabase
                    .from('likes')
                    .insert([likeData]);
                
                if (error) {
                    totalSkipped++;
                } else {
                    totalImported++;
                }
                
            } catch (err) {
                totalSkipped++;
            }
        }
    }
    
    console.log(`❤️  Likes import complete: ${totalImported} imported, ${totalSkipped} skipped`);
}

async function importMessages(sqlContent) {
    console.log('💬 Processing messages...');
    
    const messageInserts = sqlContent.match(/INSERT INTO `messages`[^;]+;/gs);
    if (!messageInserts) {
        console.log('❌ No messages data found');
        return;
    }
    
    const { data: members } = await supabase
        .from('members')
        .select('id, member_id');
    
    const memberMap = new Map(
        members.map(m => [m.member_id - 1000000, m.id])
    );
    
    let totalImported = 0;
    let totalSkipped = 0;
    
    for (const insertStmt of messageInserts) {
        const rows = parseInsertValues(insertStmt);
        
        for (const row of rows) {
            try {
                const senderId = memberMap.get(parseInt(row[2]));
                const receiverId = memberMap.get(parseInt(row[3]));
                
                if (!senderId || !receiverId) {
                    totalSkipped++;
                    continue;
                }
                
                const messageData = {
                    message: row[1],
                    sender_id: senderId,
                    receiver_id: receiverId,
                    timestamp: convertMySQLTimestamp(row[4]),
                    chat_id: row[5],
                    is_read: row[6] === '1' || row[6] === 'true'
                };
                
                const { error } = await supabase
                    .from('messages')
                    .insert([messageData]);
                
                if (error) {
                    totalSkipped++;
                } else {
                    totalImported++;
                }
                
            } catch (err) {
                totalSkipped++;
            }
        }
    }
    
    console.log(`💬 Messages import complete: ${totalImported} imported, ${totalSkipped} skipped`);
}

async function main() {
    console.log('🚀 Starting complete MySQL data import...');
    
    const sqlPath = path.join(process.cwd(), 'scripts', 'mysql-import-data.sql');
    
    if (!fs.existsSync(sqlPath)) {
        console.error('❌ SQL file not found at:', sqlPath);
        process.exit(1);
    }
    
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    console.log(`📁 Loaded SQL file: ${(sqlContent.length / 1024 / 1024).toFixed(1)} MB`);
    
    try {
        await importMembers(sqlContent);
        await importImageLinks(sqlContent);
        await importLikes(sqlContent);
        await importMessages(sqlContent);
        
        console.log('');
        console.log('✅ Complete data import finished!');
        console.log('');
        console.log('📋 Next steps:');
        console.log('1. Remove password field from members table');
        console.log('2. Set up authentication flow for existing users');
        console.log('3. Link user_id when users register/login');
        console.log('4. Verify data integrity and relationships');
        
    } catch (error) {
        console.error('❌ Import failed:', error);
        process.exit(1);
    }
}

main();