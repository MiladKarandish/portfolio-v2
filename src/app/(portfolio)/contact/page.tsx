import { contactLinks } from "@/data/contacts";

const ContactPage = () => {
  return (
    <main>
      {/* Contact addresses */}
      <>
        <ul className={`bg-800 rounded-md divide-y`}>
          {contactLinks.map((contactLink) => (
            <li key={contactLink.title} className={`p-2`}>
              {contactLink.name}
            </li>
          ))}
        </ul>
      </>
    </main>
  );
};

export default ContactPage;
