import TagRepository from '../domain/repository/TagRepository.js';

export default {
    async normalizeAndSaveTags(tags: string[]) {
        const tagSet = [...new Set(tags.map(t => t.trim().toLowerCase()))];
        const tagResult = await TagRepository.createManyTags(tagSet);
        return tagResult.map(tag => tag.id);
    },

    async updateTags(oldTagsIds: string[], newTagNames: string[]) {
        const tagSet = [...new Set(newTagNames.map(t => t.trim().toLowerCase()))];
        const oldTagsObjs = await TagRepository.getTagsByIds(oldTagsIds);
        const oldTagNames = oldTagsObjs.map(tag => tag.name);
        const tagsToAddInDB = tagSet.filter(tagName => !oldTagNames.includes(tagName));
        console.log("Old tag names:", oldTagNames);        
        console.log("New tag names:", tagSet);
        console.log("Tags to add in DB:", tagsToAddInDB);
        const addedTags = tagsToAddInDB.length > 0 ? await TagRepository.createManyTags(tagsToAddInDB) : [];
        const allTags = [...oldTagsObjs, ...addedTags];
        const filteredTags = allTags.filter(tag => tagSet.includes(tag.name));
        return filteredTags.map(tag => tag.id); //ritorna array di nomi dei tag senza duplicati
    },

    async getTagsByIds(tagIds: string[]) {
        return await TagRepository.getTagsByIds(tagIds);
    },

    async fullTextSearch(name: string) {
        const normalizedTagName = name.trim().toLowerCase();
        const tags = await TagRepository.fullTextSearchByName(normalizedTagName);
        return tags.map(tag => tag.id);
    }
}