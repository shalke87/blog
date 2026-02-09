import TagModel from "../../infrastructure/database/mongoose/models/tagModel.js";
    
export default {
    async createManyTags(tags) {
        console.log("Creating tags with data:", tags);
        try{
            const result = await TagModel.insertMany(
                tags.map(tag => ({ name: tag }))
            );

            console.log("Tags created:", result);
            return result.map(tag => tag.toObject());
        } catch (error) {
            console.error("Error creating tag:", error);
            throw error;
        }
    },

    async getTagsByIds(tagIds) {
        try{
            const tags = await TagModel.find({ _id: { $in: tagIds } });
            return tags.map(tag => tag.toObject());
        } catch (error) {
            console.error("Error retrieving tags by IDs:", error);
            throw error;
        }
    },

    async fullTextSearchByName(name) {
        try {
            const tags = await TagModel.find(
                { $text: { $search: name } },  // $text è l'indice definito nel modello
                { score: { $meta: "textScore" } })
            return tags.map(tag => tag.toObject());
        } catch (error) {
            console.error("Error searching tags by name:", error);
            throw error;
        }
    }
}