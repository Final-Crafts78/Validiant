const supabase = require("../config/supabase");

/**
 * App Settings Service
 */
class SettingsService {
  /**
   * Get a setting by key
   */
  async getSetting(key) {
    const { data, error } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", key)
      .single();

    if (error && error.code !== "PGRST116") { // Ignore 'row not found' error
      throw error;
    }

    return data ? data.value : null;
  }

  /**
   * Set or update a setting by key
   */
  async setSetting(key, value, updatedBy) {
    const { error } = await supabase
      .from("app_settings")
      .upsert({
        key,
        value,
        updated_by: updatedBy,
        updated_at: new Date()
      }, { onConflict: 'key' });

    if (error) {
      throw error;
    }
    return true;
  }
}

module.exports = new SettingsService();
