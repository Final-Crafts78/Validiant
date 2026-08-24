/**
 * WhatsApp Dispatch Utilities & Static Template Compiler
 */
import { state } from '../store/globalState';

/**
 * Cleanly compiles the BGV (Background Verification) message template.
 * Safely handles missing fields to avoid leftover braces, empty parentheses, or bad punctuation.
 */
export const getCompiledMessage = (task) => {
  const individualName = (task.client_name || task.clientName || '').trim();
  const communityName = (task.community_name || task.communityName || '').trim();
  const address = (task.address || '').trim();
  
  let assignedTo = (task.assignedToName || '').trim();
  let assignedNo = (task.assignedToPhone || '').trim();
  
  // If the logged in user is an employee and they are assigned to this task, fallback to their profile
  if (state.currentUser && state.currentUser.role === 'employee') {
    assignedTo = (state.currentUser.name || assignedTo).trim();
    assignedNo = (state.currentUser.phone || assignedNo).trim();
  }
  
  // Format parts cleanly
  const greeting = individualName ? `Hi ${individualName},` : `Hi,`;
  const sourceText = communityName ? ` from ${communityName}` : '';
  const addressText = address ? ` in the given address at\n\n${address}.` : '.';
  
  // Format executive assignment text to avoid empty parentheses e.g. "()"
  let executiveText = '';
  if (assignedTo && assignedNo) {
    executiveText = `our executive ${assignedTo} (${assignedNo}) will visit shortly`;
  } else if (assignedTo) {
    executiveText = `our executive ${assignedTo} will visit shortly`;
  } else {
    executiveText = `our executive will visit shortly`;
  }
  
  return `${greeting}

you have background verification${sourceText}${addressText}

Please share your google map location URL link here and ${executiveText}, Thank you.`;
};

/**
 * Cleans the phone number, opens WhatsApp click-to-chat API, and updates task's whatsapp_sent status in DB.
 */
export const handleSendWhatsApp = async (task, onStateChange) => {
  const phone = task.individual_phone || task.individualPhone;
  if (!phone) {
    alert('No phone number available for this contact.');
    return;
  }
  
  // Clean phone number: remove any non-digit characters (like '+', '-', spaces)
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Compile our dynamic text
  const messageText = getCompiledMessage(task);
  const encodedText = encodeURIComponent(messageText);
  
  // Build the official click-to-chat link
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodedText}`;
  window.open(waUrl, '_blank');
  
  // Asynchronously update the task's database state to trigger Sent -> Resend transition
  try {
    const res = await fetch(`/api/tasks/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        whatsapp_sent: true,
        userId: state.currentUser?.id,
        userName: state.currentUser?.name
      })
    });
    
    if (res.ok) {
      task.whatsapp_sent = true;
      // Patch all state arrays to ensure consistent Resend state regardless of lookup source
      const patchSent = (arr) => {
        if (!arr) return;
        const t = arr.find(item => item.id == task.id);
        if (t) t.whatsapp_sent = true;
      };
      patchSent(state.allAdminTasks);
      patchSent(state.currentFilteredTasks);
      patchSent(state.allUnassignedTasks);
      patchSent(state.allEmployeeTasks);
      if (onStateChange) {
        onStateChange();
      }
    }
  } catch (err) {
    console.error('[WhatsApp] Failed to update sent status in Supabase:', err);
  }
};
