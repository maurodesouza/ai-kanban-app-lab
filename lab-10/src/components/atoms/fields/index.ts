import { Input as InputControl } from "./input";
import { Numeric } from "./numeric";
import { Template } from "./templates";
import { Textarea } from "./textarea";

// Input is the bare control (function) + the Template namespace attached.
// Access: <Input />, <Input.Template.Simple label="..." />
const Input = Object.assign(InputControl, { Template });

export const AtomsFields = {
    Input,
    Textarea,
    Numeric,
};

export { Input, Numeric, Textarea };
