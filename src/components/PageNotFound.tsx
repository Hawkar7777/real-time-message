import { useNavigate } from "react-router";
import Button from "../ui/Button";
import { IoCaretBackSharp } from "react-icons/io5";

export default function PageNotFound() {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex items-center justify-center  ">
      <div className="flex flex-col gap-7 items-center justify-center">
        <p className="text-3xl font-semibold">404 Page Not Found</p>
        <Button
          onClick={() => navigate(-1)}
          className="bg-purple-100 text-purple-700  text-5xl hover:bg-purple-200 transition-all duration-300 "
        >
          <div className="flex items-center gap-2">
            <IoCaretBackSharp />
            Back
          </div>
        </Button>
      </div>
    </div>
  );
}
