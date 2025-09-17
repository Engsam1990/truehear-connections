import { createClient } from '@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Database {
  public: {
    Tables: {
      members: {
        Row: any
        Insert: any
        Update: any
      }
      img_links: {
        Row: any
        Insert: any
        Update: any
      }
      likes: {
        Row: any
        Insert: any
        Update: any
      }
      messages: {
        Row: any
        Insert: any
        Update: any
      }
    }
  }
}

function parseInsertValues(insertStatement: string): string[][] {
  const valuesMatch = insertStatement.match(/VALUES\s*(.+);?$/si);
  if (!valuesMatch) return [];
  
  let valuesStr = valuesMatch[1].replace(/;$/, '');
  const rows: string[][] = [];
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

function parseRowValues(rowStr: string): string[] {
  const values: string[] = [];
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

function cleanValue(value: string): string | null {
  if (value === 'NULL' || value === '') return null;
  if (value.startsWith("'") && value.endsWith("'")) {
    return value.slice(1, -1).replace(/''/g, "'");
  }
  if (value.startsWith('"') && value.endsWith('"')) {
    return value.slice(1, -1).replace(/""/g, '"');
  }
  return value;
}

function convertMySQLDate(dateStr: string | null): string {
  if (!dateStr || dateStr === '0000-00-00') {
    return new Date().toISOString().split('T')[0];
  }
  return dateStr;
}

function convertMySQLTimestamp(timestampStr: string | null): string {
  if (!timestampStr || timestampStr === '0000-00-00 00:00:00') {
    return new Date().toISOString();
  }
  return new Date(timestampStr).toISOString();
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient<Database>(supabaseUrl, serviceKey)
    
    // Get the SQL content from the request body
    const { sqlContent } = await req.json()
    
    const results = {
      members: { imported: 0, skipped: 0 },
      images: { imported: 0, skipped: 0 },
      likes: { imported: 0, skipped: 0 },
      messages: { imported: 0, skipped: 0 }
    }

    // Import Members
    console.log('Starting members import...')
    const memberInserts = sqlContent.match(/INSERT INTO `members`[^;]+;/gs) || []
    
    for (const insertStmt of memberInserts) {
      const rows = parseInsertValues(insertStmt)
      
      for (const row of rows) {
        try {
          const memberData = {
            name: row[1],
            gender: row[2],
            birthdate: convertMySQLDate(row[3]),
            email: row[4], // Keep original email for production
            password: row[5],
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
            member_id: parseInt(row[23]),
            location: row[24],
            last_activity: convertMySQLTimestamp(row[25]),
            about_me: row[26],
            subscription_id: row[27],
            subscribed_at: row[28] ? convertMySQLTimestamp(row[28]) : null,
            reset_token: row[29],
            reset_expires: row[30] ? convertMySQLTimestamp(row[30]) : null,
            get_news: row[31] || 'yes',
            remember_token: row[32],
            user_id: null
          }
          
          const { error } = await supabase
            .from('members')
            .insert([memberData])
          
          if (error) {
            results.members.skipped++
            console.log(`Skipped member ${memberData.name}: ${error.message}`)
          } else {
            results.members.imported++
          }
        } catch (err) {
          results.members.skipped++
        }
      }
    }

    // Import Images
    console.log('Starting images import...')
    const imageInserts = sqlContent.match(/INSERT INTO `img_links`[^;]+;/gs) || []
    
    // Get member mapping
    const { data: members } = await supabase
      .from('members')
      .select('id, member_id')
    
    const memberMap = new Map(
      members?.map(m => [m.member_id, m.id]) || []
    )
    
    for (const insertStmt of imageInserts) {
      const rows = parseInsertValues(insertStmt)
      
      for (const row of rows) {
        try {
          const originalMemberId = parseInt(row[2])
          const mappedMemberId = memberMap.get(originalMemberId)
          
          if (!mappedMemberId) {
            results.images.skipped++
            continue
          }
          
          const imageData = {
            img_id: row[1],
            member_id: mappedMemberId,
            is_primary: false
          }
          
          const { error } = await supabase
            .from('img_links')
            .insert([imageData])
          
          if (error) {
            results.images.skipped++
          } else {
            results.images.imported++
          }
        } catch (err) {
          results.images.skipped++
        }
      }
    }

    // Import Likes  
    console.log('Starting likes import...')
    const likeInserts = sqlContent.match(/INSERT INTO `likes`[^;]+;/gs) || []
    
    for (const insertStmt of likeInserts) {
      const rows = parseInsertValues(insertStmt)
      
      for (const row of rows) {
        try {
          const fromMemberId = memberMap.get(parseInt(row[1]))
          const toMemberId = memberMap.get(parseInt(row[2]))
          
          if (!fromMemberId || !toMemberId) {
            results.likes.skipped++
            continue
          }
          
          const likeData = {
            sent_from: fromMemberId,
            sent_to: toMemberId,
            timestamp: convertMySQLTimestamp(row[3]),
            like_type: 'like'
          }
          
          const { error } = await supabase
            .from('likes')
            .insert([likeData])
          
          if (error) {
            results.likes.skipped++
          } else {
            results.likes.imported++
          }
        } catch (err) {
          results.likes.skipped++
        }
      }
    }

    // Import Messages
    console.log('Starting messages import...')
    const messageInserts = sqlContent.match(/INSERT INTO `messages`[^;]+;/gs) || []
    
    for (const insertStmt of messageInserts) {
      const rows = parseInsertValues(insertStmt)
      
      for (const row of rows) {
        try {
          const senderId = memberMap.get(parseInt(row[2]))
          const receiverId = memberMap.get(parseInt(row[3]))
          
          if (!senderId || !receiverId) {
            results.messages.skipped++
            continue
          }
          
          const messageData = {
            message: row[1],
            sender_id: senderId,
            receiver_id: receiverId,
            timestamp: convertMySQLTimestamp(row[4]),
            chat_id: row[5],
            is_read: row[6] === '1' || row[6] === 'true'
          }
          
          const { error } = await supabase
            .from('messages')
            .insert([messageData])
          
          if (error) {
            results.messages.skipped++
          } else {
            results.messages.imported++
          }
        } catch (err) {
          results.messages.skipped++
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        results,
        message: 'Data import completed successfully!'
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Import error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})