import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Webhook payload processor script
async function processWebhookPayloads() {
  try {
    console.log('🚀 Starting webhook payload processing...')
    
    // Read all JSON files from the payloads directory
    const payloadsDir = path.join(__dirname, 'payloads')
    
    if (!fs.existsSync(payloadsDir)) {
      console.error('❌ Payloads directory not found. Please create a "payloads" folder and add your JSON files.')
      return
    }
    
    const files = fs.readdirSync(payloadsDir).filter(file => file.endsWith('.json'))
    
    if (files.length === 0) {
      console.log('⚠️ No JSON files found in payloads directory')
      return
    }
    
    console.log(`📁 Found ${files.length} JSON files to process`)
    
    let totalMessages = 0
    
    for (const file of files) {
      console.log(`📄 Processing ${file}...`)
      
      const filePath = path.join(payloadsDir, file)
      const fileContent = fs.readFileSync(filePath, 'utf8')
      
      try {
        const payload = JSON.parse(fileContent)
        const messages = extractMessagesFromPayload(payload)
        
        if (messages.length > 0) {
          // Send to API endpoint
          const response = await fetch('http://localhost:3000/api/webhook/process', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ messages }),
          })
          
          if (response.ok) {
            const result = await response.json()
            console.log(`✅ Processed ${result.processed} messages from ${file}`)
            totalMessages += result.processed
          } else {
            console.error(`❌ Failed to process ${file}: ${response.statusText}`)
          }
        } else {
          console.log(`⚠️ No messages found in ${file}`)
        }
      } catch (parseError) {
        console.error(`❌ Error parsing ${file}:`, parseError.message)
      }
    }
    
    console.log(`🎉 Processing complete! Total messages processed: ${totalMessages}`)
    
  } catch (error) {
    console.error('❌ Error processing webhook payloads:', error)
  }
}

function extractMessagesFromPayload(payload) {
  const messages = []
  
  try {
    // Handle different webhook payload structures
    if (payload.entry && Array.isArray(payload.entry)) {
      for (const entry of payload.entry) {
        if (entry.changes && Array.isArray(entry.changes)) {
          for (const change of entry.changes) {
            if (change.value && change.value.messages) {
              for (const message of change.value.messages) {
                const processedMessage = {
                  wa_id: message.from,
                  text: extractMessageText(message),
                  timestamp: new Date(parseInt(message.timestamp) * 1000).toISOString(),
                  type: 'incoming',
                  status: 'delivered',
                  meta_msg_id: message.id,
                  sender_name: getContactName(change.value.contacts, message.from)
                }
                messages.push(processedMessage)
              }
            }
            
            // Handle status updates
            if (change.value && change.value.statuses) {
              for (const status of change.value.statuses) {
                // This would be used to update existing message statuses
                console.log(`Status update: ${status.id} -> ${status.status}`)
              }
            }
          }
        }
      }
    }
    
    // Handle direct message arrays (custom format)
    if (Array.isArray(payload)) {
      for (const item of payload) {
        if (item.wa_id && item.text) {
          messages.push({
            wa_id: item.wa_id,
            text: item.text,
            timestamp: item.timestamp || new Date().toISOString(),
            type: item.type || 'incoming',
            status: item.status || 'delivered',
            meta_msg_id: item.meta_msg_id || item.id,
            sender_name: item.sender_name
          })
        }
      }
    }
    
  } catch (error) {
    console.error('Error extracting messages from payload:', error)
  }
  
  return messages
}

function extractMessageText(message) {
  if (message.text && message.text.body) {
    return message.text.body
  }
  
  if (message.type === 'image' && message.image) {
    return `📷 Image: ${message.image.caption || 'No caption'}`
  }
  
  if (message.type === 'document' && message.document) {
    return `📄 Document: ${message.document.filename || 'Unknown file'}`
  }
  
  if (message.type === 'audio' && message.audio) {
    return `🎵 Audio message`
  }
  
  if (message.type === 'video' && message.video) {
    return `🎥 Video: ${message.video.caption || 'No caption'}`
  }
  
  return message.text || 'Unsupported message type'
}

function getContactName(contacts, wa_id) {
  if (!contacts || !Array.isArray(contacts)) return null
  
  const contact = contacts.find(c => c.wa_id === wa_id)
  return contact ? contact.profile.name : null
}

// Run the processor
processWebhookPayloads()
