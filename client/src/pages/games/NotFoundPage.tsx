import { ButtonLink } from "../../components/ui/Button";
import { PageHero } from "../../components/ui/PageHero";

export function NotFoundPage() {
  return (
    <PageHero
      eyebrow="404"
      title="That route does not exist."
      description="Use the navigation to head back to the catalog, your dashboard, or the login page."
      actions={
        <ButtonLink to="/">
          Back Home
        </ButtonLink>
      }
    />
  );
}


