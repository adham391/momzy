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

/** Document types */
import { product }       from "./product";
import { siteSettings }  from "./siteSettings";
import { service }       from "./service";
import { review }        from "./review";

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

  // Documents
  product,
  siteSettings,
  service,
  review,
];
