import {ArticleRepository, Slug} from "./article";
import makeSlug from "slug";
import {Clock} from "./clock";
import {NotFoundError} from "./NotFoundError";
import merge from "lodash.merge";
import {ArticleInput} from "./parseArticleInput";

export const updateArticle =
    (
        articleRepository: ArticleRepository,
        clock: Clock
    ) =>
        async (slug: Slug, articleInput: ArticleInput) => {
            const existingArticle = await articleRepository.findBySlug(slug);
            if (!existingArticle) {
                throw new NotFoundError(`Article with slug ${slug} does not exist`);
            }
            const article = merge(existingArticle, articleInput);
            const now = clock();
            article.updatedAt = now;
            article.slug = makeSlug(article.title);

            await articleRepository.update(article);

            return article;
        };
