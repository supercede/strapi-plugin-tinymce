import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Editor } from "@tinymce/tinymce-react";
import { request } from "@strapi/helper-plugin";
import pluginId from "../../pluginId";
import taskRequests from "../../api/settings";
import { prefixFileUrlWithBackendUrl } from "@strapi/helper-plugin";

const TinyEditor = ({ onChange, name, value }) => {
    const [pluginConfig, setPluginConfig] = useState();
    const [apiKey, setApiKey] = useState("");
    const [loading, setLoading] = useState(true);
    const uploadUrl = `${prefixFileUrlWithBackendUrl("/upload")}`;

    const token = localStorage.getItem("jwtToken");

    useEffect(() => {
        const getApiKey = async () => {
            const data = await taskRequests.getSettings();
            if (data) {
                return setApiKey(data.data.apiKey);
            }
        };
        const getPluginConfig = async () => {
            const editor = await request(`/${pluginId}/config/editor`, {
                method: "GET",
            });
            if (editor) {
                setPluginConfig(editor);
            }
        };
        getApiKey().then(() => {
            setLoading(false)
        });
        getPluginConfig();
    }, []);

    return (
        !loading && pluginConfig ?
            <Editor
                apiKey={apiKey || ""}
                value={value}
                tagName={name}
                onEditorChange={(editorContent) => {
                    onChange({ target: { name, value: editorContent } });
                }}
                outputFormat={pluginConfig?.outputFormat || "html"}
                init={{
                    ...pluginConfig?.editorConfig,
                    images_upload_handler: async (blobInfo) => {
                      const formData = new FormData();
                      formData.append("files", blobInfo.blob());
                      const response = await fetch(uploadUrl, {
                        method: "POST",
                        headers: {
                          Authorization: `Bearer ${token.indexOf('"') === 0 ? token.slice(1, -1) : token}`,
                        },
                        body: formData,
                      })
                        const result = await response.json();
                        return result[0].url;
                    },
                  }}
            />
            : <></>
    );
};
TinyEditor.propTypes = {
    onChange: PropTypes.func.isRequired,
    name: PropTypes.string.isRequired,
    value: PropTypes.string,
};
export default TinyEditor;
