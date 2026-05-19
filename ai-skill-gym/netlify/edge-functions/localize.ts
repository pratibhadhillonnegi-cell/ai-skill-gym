import type { Context, Config } from "@netlify/edge-functions";
import localizationData from "../../frontend/data/localization.json" assert { type: "json" };

export default async (request: Request, context: Context) => {
  const countryCode = context.geo?.country?.code || "US";
  const localizedValues = localizationData[countryCode as keyof typeof localizationData] || localizationData["US"];

  const response = await context.next();

  // Only rewrite HTML pages
  if (response.headers.get("content-type")?.includes("text/html")) {
    const rewriter = new HTMLRewriter().on("[data-localize]", {
      element(element) {
        const key = element.getAttribute("data-localize");
        if (key && localizedValues[key as keyof typeof localizedValues]) {
          element.setInnerContent(localizedValues[key as keyof typeof localizedValues]);
        }
      }
    });

    const rewrittenResponse = rewriter.transform(response);
    rewrittenResponse.headers.set("X-Geo-Country", countryCode);
    return rewrittenResponse;
  }

  response.headers.set("X-Geo-Country", countryCode);
  return response;
};

export const config: Config = {
  path: "/*"
};
