import type { SchemaTypeDefinition } from "sanity";

/** Nested Object types */
import { productSpecification } from "./objects/productSpecification";
import { productShippingInfo }  from "./objects/productShippingInfo";
import { productContent }       from "./objects/productContent";
import { productGiftTarget }    from "./objects/productGiftTarget";
import { productTestimonial }   from "./objects/productTestimonial";
import { productFAQ }           from "./objects/productFAQ";
import { productStory }         from "./objects/productStory";
import productTag               from "./objects/productTag";
import { articleBody }          from "./objects/articleBody";

/** Document types */
import { product }       from "./product";
import { siteSettings }  from "./siteSettings";
import { service }       from "./service";
import { review }        from "./review";
import { homePage }      from "./homePage";
import { aboutPage }     from "./aboutPage";
import { article }       from "./article";

/**
 * تجميع كل Sanity schemas
 * الـ objects تأتي أولاً — الـ documents تأتي بعدها
 */
export const schemaTypes: SchemaTypeDefinition[] = [
  // Objects (nested)
  productSpecification,
  productShippingInfo,
  productContent,
  productGiftTarget,
  productTestimonial,
  productFAQ,
  productStory,
  productTag,
  articleBody,

  // Documents
  product,
  siteSettings,
  service,
  review,
  homePage,
  aboutPage,
  article,
];
