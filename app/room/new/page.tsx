import { AppFrame } from "@/components/layout/AppFrame";
import { CreateRoomForm } from "@/components/room/CreateRoomForm";

type NewRoomPageProps = {
  searchParams: {
    error?: string;
  };
};

export default function NewRoomPage({ searchParams }: NewRoomPageProps) {
  return (
    <AppFrame>
      <CreateRoomForm error={searchParams.error} />
    </AppFrame>
  );
}
