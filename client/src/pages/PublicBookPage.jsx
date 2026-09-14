import { useParams } from 'react-router-dom';
import PagePlaceholder from '../components/PagePlaceholder.jsx';

export default function PublicBookPage() {
  const { username } = useParams();

  return (
    <PagePlaceholder eyebrow="Public memory book" title={`@${username}`}>
      This route will show the owner’s public profile and guest memory form.
    </PagePlaceholder>
  );
}
