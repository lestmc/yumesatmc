const { NetlifyStorage } = require('./netlifyStorage');
const storage = new NetlifyStorage();

// 确保文件存在
async function ensureFiles() {
    try {
        await storage.access(USERS_FILE);
    } catch {
        await storage.writeFile(USERS_FILE, '[]');
    }
    try {
        await storage.access(RESOURCES_FILE);
    } catch {
        await storage.writeFile(RESOURCES_FILE, '[]');
    }
}

// 用户数据操作
const userStorage = {
    async getAll() {
        await ensureFiles();
        const data = await storage.readFile(USERS_FILE, 'utf8');
        return JSON.parse(data);
    },

    async findById(id) {
        const users = await this.getAll();
        return users.find(user => user.id === id);
    },

    async findByEmail(email) {
        const users = await this.getAll();
        return users.find(user => user.email === email);
    },

    async create(userData) {
        const users = await this.getAll();
        const newUser = {
            id: Date.now().toString(),
            ...userData,
            createdAt: new Date().toISOString()
        };
        users.push(newUser);
        await storage.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
        return newUser;
    },

    async update(id, userData) {
        const users = await this.getAll();
        const index = users.findIndex(user => user.id === id);
        if (index === -1) return null;
        
        users[index] = { ...users[index], ...userData };
        await storage.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
        return users[index];
    }
};

// 资源数据操作
const resourceStorage = {
    async getAll() {
        await ensureFiles();
        const data = await storage.readFile(RESOURCES_FILE, 'utf8');
        return JSON.parse(data);
    },

    async findById(id) {
        const resources = await this.getAll();
        return resources.find(resource => resource.id === id);
    },

    async create(resourceData) {
        const resources = await this.getAll();
        const newResource = {
            id: Date.now().toString(),
            ...resourceData,
            status: 'pending',
            downloads: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        resources.push(newResource);
        await storage.writeFile(RESOURCES_FILE, JSON.stringify(resources, null, 2));
        return newResource;
    },

    async updateStatus(id, status, reviewComment = '') {
        const resources = await this.getAll();
        const index = resources.findIndex(resource => resource.id === id);
        if (index === -1) return null;
        
        resources[index] = {
            ...resources[index],
            status,
            reviewComment,
            updatedAt: new Date().toISOString()
        };
        await storage.writeFile(RESOURCES_FILE, JSON.stringify(resources, null, 2));
        return resources[index];
    },

    async getFeatured() {
        const resources = await this.getAll();
        return resources
            .filter(r => r.status === 'approved')
            .sort((a, b) => b.downloads - a.downloads)
            .slice(0, 6);
    },

    async update(id, resourceData) {
        const resources = await this.getAll();
        const index = resources.findIndex(resource => resource.id === id);
        if (index === -1) return null;
        
        resources[index] = {
            ...resources[index],
            ...resourceData,
            updatedAt: new Date().toISOString()
        };
        await storage.writeFile(RESOURCES_FILE, JSON.stringify(resources, null, 2));
        return resources[index];
    },

    async delete(id) {
        const resources = await this.getAll();
        const index = resources.findIndex(resource => resource.id === id);
        if (index === -1) return false;
        
        resources.splice(index, 1);
        await storage.writeFile(RESOURCES_FILE, JSON.stringify(resources, null, 2));
        return true;
    },

    async incrementDownloads(id) {
        const resources = await this.getAll();
        const index = resources.findIndex(resource => resource.id === id);
        if (index === -1) return null;
        
        resources[index].downloads += 1;
        await storage.writeFile(RESOURCES_FILE, JSON.stringify(resources, null, 2));
        return resources[index];
    },

    async resubmit(id) {
        const resources = await this.getAll();
        const index = resources.findIndex(resource => resource.id === id);
        if (index === -1) return null;
        
        resources[index] = {
            ...resources[index],
            status: 'pending',
            reviewComment: '',
            updatedAt: new Date().toISOString()
        };
        await storage.writeFile(RESOURCES_FILE, JSON.stringify(resources, null, 2));
        return resources[index];
    },

    async getUserResources(userId) {
        const resources = await this.getAll();
        return resources.filter(r => r.author === userId);
    }
};

module.exports = {
    userStorage,
    resourceStorage
}; 