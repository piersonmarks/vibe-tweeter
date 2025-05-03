import { Card, CardContent } from "@/components/ui/card";
import { imageHelpers } from "@/lib/image-helpers";
import { OpenAIIcon } from "@/lib/logos";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import Link from "next/link";

interface ModelSelectProps {
  label: string;
  models: string[];
  value: string;
  onChange: (value: string) => void;
  iconPath: string;
  color: string;
}

export function ModelSelect({
  label,
  models,
  value,
  onChange,
}: ModelSelectProps) {
  return (
    <Card className="w-full">
      <CardContent className="pt-6 h-full">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2 w-full">
            <div className="bg-primary p-2 rounded-full">
              <Link
                className="hover:opacity-80"
                href="https://sdk.vercel.ai/providers/ai-sdk-providers/openai"
                target="_blank"
              >
                <div className="text-primary-foreground">
                  <OpenAIIcon size={28} />
                </div>
              </Link>
            </div>
            <div className="flex flex-col w-full">
              <Link
                className="hover:opacity-80"
                href="https://sdk.vercel.ai/providers/ai-sdk-providers/openai"
                target="_blank"
              >
                <h3 className="font-semibold text-lg">{label}</h3>
              </Link>
              <div className="flex justify-between items-center w-full">
                <Select
                  defaultValue={value}
                  value={value}
                  onValueChange={onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={value || "Select a model"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {models.map((model) => (
                        <SelectItem key={model} value={model} className="">
                          <span className="hidden xl:inline">
                            {imageHelpers.formatModelId(model).length > 30
                              ? imageHelpers.formatModelId(model).slice(0, 30) +
                              "..."
                              : imageHelpers.formatModelId(model)}
                          </span>
                          <span className="hidden lg:inline xl:hidden">
                            {imageHelpers.formatModelId(model).length > 20
                              ? imageHelpers.formatModelId(model).slice(0, 20) +
                              "..."
                              : imageHelpers.formatModelId(model)}
                          </span>

                          <span className="lg:hidden">
                            {imageHelpers.formatModelId(model)}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
