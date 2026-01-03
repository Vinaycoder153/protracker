// ============================================
// SUPABASE CONFIGURATION
// ============================================

// Supabase connection details
const SUPABASE_CONFIG = {
    url: 'https://hhbyaxnupcmgukjugfus.supabase.co',
    anonKey: 'sb_publishable_KEeW0yMb290X2zIDUDr1iw_EkmdbK2I', // Get this from Supabase Dashboard > Settings > API

    // Database connection (for reference)
    // postgresql://postgres:[YOUR-PASSWORD]@db.hhbyaxnupcmgukjugfus.supabase.co:5432/postgres
};

// ============================================
// SUPABASE CLIENT INITIALIZATION
// ============================================

class SupabaseManager {
    constructor() {
        this.supabase = null;
        this.userId = null;
        this.syncEnabled = false;
    }

    async init(supabaseUrl, supabaseKey) {
        try {
            // Initialize Supabase client
            this.supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

            // Check if user is authenticated
            const { data: { user } } = await this.supabase.auth.getUser();
            this.userId = user?.id || this.getOrCreateDeviceId();

            this.syncEnabled = true;
            console.log('✅ Supabase initialized successfully');
            return true;
        } catch (error) {
            console.warn('⚠️ Supabase initialization failed:', error.message);
            console.log('📱 Falling back to localStorage only');
            return false;
        }
    }

    getOrCreateDeviceId() {
        let deviceId = localStorage.getItem('deviceId');
        if (!deviceId) {
            deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('deviceId', deviceId);
        }
        return deviceId;
    }

    // ============================================
    // CLOUD SYNC METHODS
    // ============================================

    async syncToCloud(data) {
        if (!this.syncEnabled || !this.supabase) {
            return { success: false, error: 'Sync not enabled' };
        }

        try {
            const { data: result, error } = await this.supabase
                .from('user_data')
                .upsert({
                    user_id: this.userId,
                    data: data,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'user_id'
                });

            if (error) throw error;

            console.log('☁️ Data synced to cloud');
            return { success: true, data: result };
        } catch (error) {
            console.error('❌ Cloud sync failed:', error.message);
            return { success: false, error: error.message };
        }
    }

    async syncFromCloud() {
        if (!this.syncEnabled || !this.supabase) {
            return { success: false, error: 'Sync not enabled' };
        }

        try {
            const { data, error } = await this.supabase
                .from('user_data')
                .select('data, updated_at')
                .eq('user_id', this.userId)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    // No data found, this is first sync
                    return { success: true, data: null, firstSync: true };
                }
                throw error;
            }

            console.log('☁️ Data loaded from cloud');
            return { success: true, data: data.data, updatedAt: data.updated_at };
        } catch (error) {
            console.error('❌ Cloud sync failed:', error.message);
            return { success: false, error: error.message };
        }
    }

    async mergeData(localData, cloudData) {
        if (!cloudData) return localData;

        // Simple merge strategy: use most recent data
        const localTime = new Date(localData.lastActive).getTime();
        const cloudTime = new Date(cloudData.lastActive).getTime();

        if (cloudTime > localTime) {
            console.log('📥 Using cloud data (more recent)');
            return cloudData;
        } else {
            console.log('📤 Using local data (more recent)');
            return localData;
        }
    }

    // ============================================
    // REAL-TIME SYNC (OPTIONAL)
    // ============================================

    subscribeToChanges(callback) {
        if (!this.syncEnabled || !this.supabase) return null;

        const subscription = this.supabase
            .channel('user_data_changes')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'user_data',
                filter: `user_id=eq.${this.userId}`
            }, (payload) => {
                console.log('🔄 Real-time update received');
                callback(payload.new.data);
            })
            .subscribe();

        return subscription;
    }

    unsubscribe(subscription) {
        if (subscription) {
            this.supabase.removeChannel(subscription);
        }
    }
}

// ============================================
// EXPORT
// ============================================

window.SupabaseManager = SupabaseManager;
window.SUPABASE_CONFIG = SUPABASE_CONFIG;
