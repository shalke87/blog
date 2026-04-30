import TagModel, {ITag} from "../../infrastructure/database/mongoose/models/tagModel.js";

export default {
    async createManyTags(tags: string[]) {
        try {
            // 1) Trova i tag già presenti
            const existing = await TagModel.find({ name: { $in: tags } });
            const existingNames = new Set(existing.map(t => t.name));
            // 2) Filtra solo i nuovi
            const toInsert = tags
                .filter(tag => !existingNames.has(tag))
                .map(tag => ({ name: tag }));
        
            let inserted: ITag[] = [];
            if (toInsert.length > 0) {
                inserted = await TagModel.insertMany(toInsert, { ordered: false });
            }
            // 3) Ritorna sia quelli già presenti che quelli nuovi
            return [...existing, ...inserted].map(t => ({ id: t._id.toString(), name: t.name }));
        } catch (error) {
            console.error("Error creating tags:", error);
            throw error;
        }
    },


    async getTagsByIds(tagIds: string[]) {
        try {
            const tags = await TagModel.find({ _id: { $in: tagIds } });
            return tags.map(tag => ({ id: tag._id.toString(), name: tag.name }));
        } catch (error) {
            console.error("Error retrieving tags by IDs:", error);
            throw error;
        }
    },

    async fullTextSearchByName(name: string) : Promise<{ id: string; name: string }[]> {
        try {
            const tags = await TagModel.find(
                { $text: { $search: name } },  // $text è l'indice definito nel modello
                { score: { $meta: "textScore" } })
            return tags.map(tag => ({ id: tag._id.toString(), name: tag.name }));
        } catch (error) {
            console.error("Error searching tags by name:", error);
            throw error;
        }
    }
}