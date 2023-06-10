"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const starterIndex = require("./starterIndex.6eca756e.js");
require("obsidian");
require("fs");
require("path");
require("os");
require("crypto");
class BaseChatModel extends starterIndex.BaseLanguageModel {
  constructor(fields) {
    super(fields);
  }
  async generate(messages, options, callbacks) {
    var _a;
    const generations = [];
    const llmOutputs = [];
    let parsedOptions;
    if (Array.isArray(options)) {
      parsedOptions = { stop: options };
    } else if ((options == null ? void 0 : options.timeout) && !options.signal) {
      parsedOptions = {
        ...options,
        signal: AbortSignal.timeout(options.timeout)
      };
    } else {
      parsedOptions = options != null ? options : {};
    }
    const callbackManager_ = await starterIndex.CallbackManager.configure(callbacks, this.callbacks, { verbose: this.verbose });
    const invocationParams = { invocation_params: this == null ? void 0 : this.invocationParams() };
    const runManager = await (callbackManager_ == null ? void 0 : callbackManager_.handleChatModelStart({ name: this._llmType() }, messages, void 0, void 0, invocationParams));
    try {
      const results = await Promise.all(messages.map((messageList) => this._generate(messageList, parsedOptions, runManager)));
      for (const result of results) {
        if (result.llmOutput) {
          llmOutputs.push(result.llmOutput);
        }
        generations.push(result.generations);
      }
    } catch (err) {
      await (runManager == null ? void 0 : runManager.handleLLMError(err));
      throw err;
    }
    const output = {
      generations,
      llmOutput: llmOutputs.length ? (_a = this._combineLLMOutput) == null ? void 0 : _a.call(this, ...llmOutputs) : void 0
    };
    await (runManager == null ? void 0 : runManager.handleLLMEnd(output));
    Object.defineProperty(output, starterIndex.RUN_KEY, {
      value: runManager ? { runId: runManager == null ? void 0 : runManager.runId } : void 0,
      configurable: true
    });
    return output;
  }
  invocationParams() {
    return {};
  }
  _modelType() {
    return "base_chat_model";
  }
  async generatePrompt(promptValues, options, callbacks) {
    const promptMessages = promptValues.map((promptValue) => promptValue.toChatMessages());
    return this.generate(promptMessages, options, callbacks);
  }
  async call(messages, options, callbacks) {
    const result = await this.generate([messages], options, callbacks);
    const generations = result.generations;
    return generations[0][0].message;
  }
  async callPrompt(promptValue, options, callbacks) {
    const promptMessages = promptValue.toChatMessages();
    return this.call(promptMessages, options, callbacks);
  }
  async predictMessages(messages, options, callbacks) {
    return this.call(messages, options, callbacks);
  }
  async predict(text, options, callbacks) {
    const message = new starterIndex.HumanChatMessage(text);
    const result = await this.call([message], options, callbacks);
    return result.text;
  }
}
function messageTypeToOpenAIRole(type) {
  switch (type) {
    case "system":
      return "system";
    case "ai":
      return "assistant";
    case "human":
      return "user";
    default:
      throw new Error(`Unknown message type: ${type}`);
  }
}
function openAIResponseToChatMessage(role, text) {
  switch (role) {
    case "user":
      return new starterIndex.HumanChatMessage(text);
    case "assistant":
      return new starterIndex.AIChatMessage(text);
    case "system":
      return new starterIndex.SystemChatMessage(text);
    default:
      return new starterIndex.ChatMessage(text, role != null ? role : "unknown");
  }
}
class ChatOpenAI extends BaseChatModel {
  get callKeys() {
    return ["stop", "signal", "timeout", "options"];
  }
  constructor(fields, configuration) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m;
    super(fields != null ? fields : {});
    Object.defineProperty(this, "temperature", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 1
    });
    Object.defineProperty(this, "topP", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 1
    });
    Object.defineProperty(this, "frequencyPenalty", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 0
    });
    Object.defineProperty(this, "presencePenalty", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 0
    });
    Object.defineProperty(this, "n", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 1
    });
    Object.defineProperty(this, "logitBias", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "modelName", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "gpt-3.5-turbo"
    });
    Object.defineProperty(this, "modelKwargs", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "stop", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "timeout", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "streaming", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: false
    });
    Object.defineProperty(this, "maxTokens", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "azureOpenAIApiVersion", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "azureOpenAIApiKey", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "azureOpenAIApiInstanceName", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "azureOpenAIApiDeploymentName", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "client", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "clientConfig", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    const apiKey = (_a = fields == null ? void 0 : fields.openAIApiKey) != null ? _a : starterIndex.getEnvironmentVariable("OPENAI_API_KEY");
    const azureApiKey = (_b = fields == null ? void 0 : fields.azureOpenAIApiKey) != null ? _b : starterIndex.getEnvironmentVariable("AZURE_OPENAI_API_KEY");
    if (!azureApiKey && !apiKey) {
      throw new Error("(Azure) OpenAI API key not found");
    }
    const azureApiInstanceName = (_c = fields == null ? void 0 : fields.azureOpenAIApiInstanceName) != null ? _c : starterIndex.getEnvironmentVariable("AZURE_OPENAI_API_INSTANCE_NAME");
    const azureApiDeploymentName = (_d = fields == null ? void 0 : fields.azureOpenAIApiDeploymentName) != null ? _d : starterIndex.getEnvironmentVariable("AZURE_OPENAI_API_DEPLOYMENT_NAME");
    const azureApiVersion = (_e = fields == null ? void 0 : fields.azureOpenAIApiVersion) != null ? _e : starterIndex.getEnvironmentVariable("AZURE_OPENAI_API_VERSION");
    this.modelName = (_f = fields == null ? void 0 : fields.modelName) != null ? _f : this.modelName;
    this.modelKwargs = (_g = fields == null ? void 0 : fields.modelKwargs) != null ? _g : {};
    this.timeout = fields == null ? void 0 : fields.timeout;
    this.temperature = (_h = fields == null ? void 0 : fields.temperature) != null ? _h : this.temperature;
    this.topP = (_i = fields == null ? void 0 : fields.topP) != null ? _i : this.topP;
    this.frequencyPenalty = (_j = fields == null ? void 0 : fields.frequencyPenalty) != null ? _j : this.frequencyPenalty;
    this.presencePenalty = (_k = fields == null ? void 0 : fields.presencePenalty) != null ? _k : this.presencePenalty;
    this.maxTokens = fields == null ? void 0 : fields.maxTokens;
    this.n = (_l = fields == null ? void 0 : fields.n) != null ? _l : this.n;
    this.logitBias = fields == null ? void 0 : fields.logitBias;
    this.stop = fields == null ? void 0 : fields.stop;
    this.streaming = (_m = fields == null ? void 0 : fields.streaming) != null ? _m : false;
    this.azureOpenAIApiVersion = azureApiVersion;
    this.azureOpenAIApiKey = azureApiKey;
    this.azureOpenAIApiInstanceName = azureApiInstanceName;
    this.azureOpenAIApiDeploymentName = azureApiDeploymentName;
    if (this.streaming && this.n > 1) {
      throw new Error("Cannot stream results when n > 1");
    }
    if (this.azureOpenAIApiKey) {
      if (!this.azureOpenAIApiInstanceName) {
        throw new Error("Azure OpenAI API instance name not found");
      }
      if (!this.azureOpenAIApiDeploymentName) {
        throw new Error("Azure OpenAI API deployment name not found");
      }
      if (!this.azureOpenAIApiVersion) {
        throw new Error("Azure OpenAI API version not found");
      }
    }
    this.clientConfig = {
      apiKey,
      ...configuration
    };
  }
  invocationParams() {
    return {
      model: this.modelName,
      temperature: this.temperature,
      top_p: this.topP,
      frequency_penalty: this.frequencyPenalty,
      presence_penalty: this.presencePenalty,
      max_tokens: this.maxTokens === -1 ? void 0 : this.maxTokens,
      n: this.n,
      logit_bias: this.logitBias,
      stop: this.stop,
      stream: this.streaming,
      ...this.modelKwargs
    };
  }
  _identifyingParams() {
    return {
      model_name: this.modelName,
      ...this.invocationParams(),
      ...this.clientConfig
    };
  }
  identifyingParams() {
    return this._identifyingParams();
  }
  async _generate(messages, options, runManager) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i;
    const tokenUsage = {};
    if (this.stop && (options == null ? void 0 : options.stop)) {
      throw new Error("Stop found in input and default params");
    }
    const params = this.invocationParams();
    params.stop = (_a = options == null ? void 0 : options.stop) != null ? _a : params.stop;
    const messagesMapped = messages.map((message) => ({
      role: messageTypeToOpenAIRole(message._getType()),
      content: message.text,
      name: message.name
    }));
    const data = params.stream ? await new Promise((resolve, reject) => {
      let response;
      let rejected = false;
      let resolved = false;
      this.completionWithRetry({
        ...params,
        messages: messagesMapped
      }, {
        signal: options == null ? void 0 : options.signal,
        ...options == null ? void 0 : options.options,
        adapter: starterIndex.fetchAdapter,
        responseType: "stream",
        onmessage: (event) => {
          var _a2, _b2, _c2, _d2, _e2, _f2, _g2, _h2, _i2, _j;
          if (((_b2 = (_a2 = event.data) == null ? void 0 : _a2.trim) == null ? void 0 : _b2.call(_a2)) === "[DONE]") {
            if (resolved) {
              return;
            }
            resolved = true;
            resolve(response);
          } else {
            const message = JSON.parse(event.data);
            if (!response) {
              response = {
                id: message.id,
                object: message.object,
                created: message.created,
                model: message.model,
                choices: []
              };
            }
            for (const part of message.choices) {
              if (part != null) {
                let choice = response.choices.find((c) => c.index === part.index);
                if (!choice) {
                  choice = {
                    index: part.index,
                    finish_reason: (_c2 = part.finish_reason) != null ? _c2 : void 0
                  };
                  response.choices[part.index] = choice;
                }
                if (!choice.message) {
                  choice.message = {
                    role: (_d2 = part.delta) == null ? void 0 : _d2.role,
                    content: (_f2 = (_e2 = part.delta) == null ? void 0 : _e2.content) != null ? _f2 : ""
                  };
                }
                choice.message.content += (_h2 = (_g2 = part.delta) == null ? void 0 : _g2.content) != null ? _h2 : "";
                void (runManager == null ? void 0 : runManager.handleLLMNewToken((_j = (_i2 = part.delta) == null ? void 0 : _i2.content) != null ? _j : ""));
              }
            }
            if (!resolved && message.choices.every((c) => c.finish_reason != null)) {
              resolved = true;
              resolve(response);
            }
          }
        }
      }).catch((error) => {
        if (!rejected) {
          rejected = true;
          reject(error);
        }
      });
    }) : await this.completionWithRetry({
      ...params,
      messages: messagesMapped
    }, {
      signal: options == null ? void 0 : options.signal,
      ...options == null ? void 0 : options.options
    });
    const { completion_tokens: completionTokens, prompt_tokens: promptTokens, total_tokens: totalTokens } = (_b = data.usage) != null ? _b : {};
    if (completionTokens) {
      tokenUsage.completionTokens = ((_c = tokenUsage.completionTokens) != null ? _c : 0) + completionTokens;
    }
    if (promptTokens) {
      tokenUsage.promptTokens = ((_d = tokenUsage.promptTokens) != null ? _d : 0) + promptTokens;
    }
    if (totalTokens) {
      tokenUsage.totalTokens = ((_e = tokenUsage.totalTokens) != null ? _e : 0) + totalTokens;
    }
    const generations = [];
    for (const part of data.choices) {
      const role = (_g = (_f = part.message) == null ? void 0 : _f.role) != null ? _g : void 0;
      const text = (_i = (_h = part.message) == null ? void 0 : _h.content) != null ? _i : "";
      generations.push({
        text,
        message: openAIResponseToChatMessage(role, text)
      });
    }
    return {
      generations,
      llmOutput: { tokenUsage }
    };
  }
  async getNumTokensFromMessages(messages) {
    let totalCount = 0;
    let tokensPerMessage = 0;
    let tokensPerName = 0;
    if (starterIndex.getModelNameForTiktoken(this.modelName) === "gpt-3.5-turbo") {
      tokensPerMessage = 4;
      tokensPerName = -1;
    } else if (starterIndex.getModelNameForTiktoken(this.modelName).startsWith("gpt-4")) {
      tokensPerMessage = 3;
      tokensPerName = 1;
    }
    const countPerMessage = await Promise.all(messages.map(async (message) => {
      const textCount = await this.getNumTokens(message.text);
      const roleCount = await this.getNumTokens(messageTypeToOpenAIRole(message._getType()));
      const nameCount = message.name !== void 0 ? tokensPerName + await this.getNumTokens(message.name) : 0;
      const count = textCount + tokensPerMessage + roleCount + nameCount;
      totalCount += count;
      return count;
    }));
    totalCount += 3;
    return { totalCount, countPerMessage };
  }
  async completionWithRetry(request, options) {
    if (!this.client) {
      const endpoint = this.azureOpenAIApiKey ? `https://${this.azureOpenAIApiInstanceName}.openai.azure.com/openai/deployments/${this.azureOpenAIApiDeploymentName}` : this.clientConfig.basePath;
      const clientConfig = new starterIndex.dist.Configuration({
        ...this.clientConfig,
        basePath: endpoint,
        baseOptions: {
          timeout: this.timeout,
          ...this.clientConfig.baseOptions
        }
      });
      this.client = new starterIndex.dist.OpenAIApi(clientConfig);
    }
    const axiosOptions = {
      adapter: starterIndex.isNode() ? void 0 : starterIndex.fetchAdapter,
      ...this.clientConfig.baseOptions,
      ...options
    };
    if (this.azureOpenAIApiKey) {
      axiosOptions.headers = {
        "api-key": this.azureOpenAIApiKey,
        ...axiosOptions.headers
      };
      axiosOptions.params = {
        "api-version": this.azureOpenAIApiVersion,
        ...axiosOptions.params
      };
    }
    return this.caller.call(this.client.createChatCompletion.bind(this.client), request, axiosOptions).then((res) => res.data);
  }
  _llmType() {
    return "openai";
  }
  _combineLLMOutput(...llmOutputs) {
    return llmOutputs.reduce((acc, llmOutput) => {
      var _a, _b, _c;
      if (llmOutput && llmOutput.tokenUsage) {
        acc.tokenUsage.completionTokens += (_a = llmOutput.tokenUsage.completionTokens) != null ? _a : 0;
        acc.tokenUsage.promptTokens += (_b = llmOutput.tokenUsage.promptTokens) != null ? _b : 0;
        acc.tokenUsage.totalTokens += (_c = llmOutput.tokenUsage.totalTokens) != null ? _c : 0;
      }
      return acc;
    }, {
      tokenUsage: {
        completionTokens: 0,
        promptTokens: 0,
        totalTokens: 0
      }
    });
  }
}
class PromptLayerChatOpenAI extends ChatOpenAI {
  constructor(fields) {
    var _a, _b, _c, _d;
    super(fields);
    Object.defineProperty(this, "promptLayerApiKey", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "plTags", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "returnPromptLayerId", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    this.promptLayerApiKey = (_b = fields == null ? void 0 : fields.promptLayerApiKey) != null ? _b : typeof process !== "undefined" ? (_a = process.env) == null ? void 0 : _a.PROMPTLAYER_API_KEY : void 0;
    this.plTags = (_c = fields == null ? void 0 : fields.plTags) != null ? _c : [];
    this.returnPromptLayerId = (_d = fields == null ? void 0 : fields.returnPromptLayerId) != null ? _d : false;
  }
  async _generate(messages, options, runManager) {
    const requestStartTime = Date.now();
    let parsedOptions;
    if (Array.isArray(options)) {
      parsedOptions = { stop: options };
    } else if ((options == null ? void 0 : options.timeout) && !options.signal) {
      parsedOptions = {
        ...options,
        signal: AbortSignal.timeout(options.timeout)
      };
    } else {
      parsedOptions = options != null ? options : {};
    }
    const generatedResponses = await super._generate(messages, parsedOptions, runManager);
    const requestEndTime = Date.now();
    const _convertMessageToDict = (message) => {
      let messageDict;
      if (message._getType() === "human") {
        messageDict = { role: "user", content: message.text };
      } else if (message._getType() === "ai") {
        messageDict = { role: "assistant", content: message.text };
      } else if (message._getType() === "system") {
        messageDict = { role: "system", content: message.text };
      } else if (message._getType() === "generic") {
        messageDict = {
          role: message.role,
          content: message.text
        };
      } else {
        throw new Error(`Got unknown type ${message}`);
      }
      return messageDict;
    };
    const _createMessageDicts = (messages2, callOptions) => {
      const params = {
        ...this.invocationParams(),
        model: this.modelName
      };
      if (callOptions == null ? void 0 : callOptions.stop) {
        if (Object.keys(params).includes("stop")) {
          throw new Error("`stop` found in both the input and default params.");
        }
      }
      const messageDicts = messages2.map((message) => _convertMessageToDict(message));
      return messageDicts;
    };
    for (let i = 0; i < generatedResponses.generations.length; i += 1) {
      const generation = generatedResponses.generations[i];
      const messageDicts = _createMessageDicts(messages, parsedOptions);
      let promptLayerRequestId;
      const parsedResp = [
        {
          content: generation.text,
          role: messageTypeToOpenAIRole(generation.message._getType())
        }
      ];
      const promptLayerRespBody = await starterIndex.promptLayerTrackRequest(this.caller, "langchain.PromptLayerChatOpenAI", messageDicts, this._identifyingParams(), this.plTags, parsedResp, requestStartTime, requestEndTime, this.promptLayerApiKey);
      if (this.returnPromptLayerId === true) {
        if (promptLayerRespBody.success === true) {
          promptLayerRequestId = promptLayerRespBody.request_id;
        }
        if (!generation.generationInfo || typeof generation.generationInfo !== "object") {
          generation.generationInfo = {};
        }
        generation.generationInfo.promptLayerRequestId = promptLayerRequestId;
      }
    }
    return generatedResponses;
  }
}
exports.ChatOpenAI = ChatOpenAI;
exports.PromptLayerChatOpenAI = PromptLayerChatOpenAI;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3BlbmFpLjczOWZiNWYzLmpzIiwic291cmNlcyI6WyJub2RlX21vZHVsZXMvbGFuZ2NoYWluL2Rpc3QvY2hhdF9tb2RlbHMvYmFzZS5qcyIsIm5vZGVfbW9kdWxlcy9sYW5nY2hhaW4vZGlzdC9jaGF0X21vZGVscy9vcGVuYWkuanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQUlDaGF0TWVzc2FnZSwgSHVtYW5DaGF0TWVzc2FnZSwgUlVOX0tFWSwgfSBmcm9tIFwiLi4vc2NoZW1hL2luZGV4LmpzXCI7XG5pbXBvcnQgeyBCYXNlTGFuZ3VhZ2VNb2RlbCwgfSBmcm9tIFwiLi4vYmFzZV9sYW5ndWFnZS9pbmRleC5qc1wiO1xuaW1wb3J0IHsgQ2FsbGJhY2tNYW5hZ2VyLCB9IGZyb20gXCIuLi9jYWxsYmFja3MvbWFuYWdlci5qc1wiO1xuZXhwb3J0IGNsYXNzIEJhc2VDaGF0TW9kZWwgZXh0ZW5kcyBCYXNlTGFuZ3VhZ2VNb2RlbCB7XG4gICAgY29uc3RydWN0b3IoZmllbGRzKSB7XG4gICAgICAgIHN1cGVyKGZpZWxkcyk7XG4gICAgfVxuICAgIGFzeW5jIGdlbmVyYXRlKG1lc3NhZ2VzLCBvcHRpb25zLCBjYWxsYmFja3MpIHtcbiAgICAgICAgY29uc3QgZ2VuZXJhdGlvbnMgPSBbXTtcbiAgICAgICAgY29uc3QgbGxtT3V0cHV0cyA9IFtdO1xuICAgICAgICBsZXQgcGFyc2VkT3B0aW9ucztcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkob3B0aW9ucykpIHtcbiAgICAgICAgICAgIHBhcnNlZE9wdGlvbnMgPSB7IHN0b3A6IG9wdGlvbnMgfTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChvcHRpb25zPy50aW1lb3V0ICYmICFvcHRpb25zLnNpZ25hbCkge1xuICAgICAgICAgICAgcGFyc2VkT3B0aW9ucyA9IHtcbiAgICAgICAgICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICAgICAgICAgIHNpZ25hbDogQWJvcnRTaWduYWwudGltZW91dChvcHRpb25zLnRpbWVvdXQpLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHBhcnNlZE9wdGlvbnMgPSBvcHRpb25zID8/IHt9O1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGNhbGxiYWNrTWFuYWdlcl8gPSBhd2FpdCBDYWxsYmFja01hbmFnZXIuY29uZmlndXJlKGNhbGxiYWNrcywgdGhpcy5jYWxsYmFja3MsIHsgdmVyYm9zZTogdGhpcy52ZXJib3NlIH0pO1xuICAgICAgICBjb25zdCBpbnZvY2F0aW9uUGFyYW1zID0geyBpbnZvY2F0aW9uX3BhcmFtczogdGhpcz8uaW52b2NhdGlvblBhcmFtcygpIH07XG4gICAgICAgIGNvbnN0IHJ1bk1hbmFnZXIgPSBhd2FpdCBjYWxsYmFja01hbmFnZXJfPy5oYW5kbGVDaGF0TW9kZWxTdGFydCh7IG5hbWU6IHRoaXMuX2xsbVR5cGUoKSB9LCBtZXNzYWdlcywgdW5kZWZpbmVkLCB1bmRlZmluZWQsIGludm9jYXRpb25QYXJhbXMpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0cyA9IGF3YWl0IFByb21pc2UuYWxsKG1lc3NhZ2VzLm1hcCgobWVzc2FnZUxpc3QpID0+IHRoaXMuX2dlbmVyYXRlKG1lc3NhZ2VMaXN0LCBwYXJzZWRPcHRpb25zLCBydW5NYW5hZ2VyKSkpO1xuICAgICAgICAgICAgZm9yIChjb25zdCByZXN1bHQgb2YgcmVzdWx0cykge1xuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQubGxtT3V0cHV0KSB7XG4gICAgICAgICAgICAgICAgICAgIGxsbU91dHB1dHMucHVzaChyZXN1bHQubGxtT3V0cHV0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZ2VuZXJhdGlvbnMucHVzaChyZXN1bHQuZ2VuZXJhdGlvbnMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGF3YWl0IHJ1bk1hbmFnZXI/LmhhbmRsZUxMTUVycm9yKGVycik7XG4gICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgb3V0cHV0ID0ge1xuICAgICAgICAgICAgZ2VuZXJhdGlvbnMsXG4gICAgICAgICAgICBsbG1PdXRwdXQ6IGxsbU91dHB1dHMubGVuZ3RoXG4gICAgICAgICAgICAgICAgPyB0aGlzLl9jb21iaW5lTExNT3V0cHV0Py4oLi4ubGxtT3V0cHV0cylcbiAgICAgICAgICAgICAgICA6IHVuZGVmaW5lZCxcbiAgICAgICAgfTtcbiAgICAgICAgYXdhaXQgcnVuTWFuYWdlcj8uaGFuZGxlTExNRW5kKG91dHB1dCk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvdXRwdXQsIFJVTl9LRVksIHtcbiAgICAgICAgICAgIHZhbHVlOiBydW5NYW5hZ2VyID8geyBydW5JZDogcnVuTWFuYWdlcj8ucnVuSWQgfSA6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBvdXRwdXQ7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgcGFyYW1ldGVycyB1c2VkIHRvIGludm9rZSB0aGUgbW9kZWxcbiAgICAgKi9cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICAgIGludm9jYXRpb25QYXJhbXMoKSB7XG4gICAgICAgIHJldHVybiB7fTtcbiAgICB9XG4gICAgX21vZGVsVHlwZSgpIHtcbiAgICAgICAgcmV0dXJuIFwiYmFzZV9jaGF0X21vZGVsXCI7XG4gICAgfVxuICAgIGFzeW5jIGdlbmVyYXRlUHJvbXB0KHByb21wdFZhbHVlcywgb3B0aW9ucywgY2FsbGJhY2tzKSB7XG4gICAgICAgIGNvbnN0IHByb21wdE1lc3NhZ2VzID0gcHJvbXB0VmFsdWVzLm1hcCgocHJvbXB0VmFsdWUpID0+IHByb21wdFZhbHVlLnRvQ2hhdE1lc3NhZ2VzKCkpO1xuICAgICAgICByZXR1cm4gdGhpcy5nZW5lcmF0ZShwcm9tcHRNZXNzYWdlcywgb3B0aW9ucywgY2FsbGJhY2tzKTtcbiAgICB9XG4gICAgYXN5bmMgY2FsbChtZXNzYWdlcywgb3B0aW9ucywgY2FsbGJhY2tzKSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuZ2VuZXJhdGUoW21lc3NhZ2VzXSwgb3B0aW9ucywgY2FsbGJhY2tzKTtcbiAgICAgICAgY29uc3QgZ2VuZXJhdGlvbnMgPSByZXN1bHQuZ2VuZXJhdGlvbnM7XG4gICAgICAgIHJldHVybiBnZW5lcmF0aW9uc1swXVswXS5tZXNzYWdlO1xuICAgIH1cbiAgICBhc3luYyBjYWxsUHJvbXB0KHByb21wdFZhbHVlLCBvcHRpb25zLCBjYWxsYmFja3MpIHtcbiAgICAgICAgY29uc3QgcHJvbXB0TWVzc2FnZXMgPSBwcm9tcHRWYWx1ZS50b0NoYXRNZXNzYWdlcygpO1xuICAgICAgICByZXR1cm4gdGhpcy5jYWxsKHByb21wdE1lc3NhZ2VzLCBvcHRpb25zLCBjYWxsYmFja3MpO1xuICAgIH1cbiAgICBhc3luYyBwcmVkaWN0TWVzc2FnZXMobWVzc2FnZXMsIG9wdGlvbnMsIGNhbGxiYWNrcykge1xuICAgICAgICByZXR1cm4gdGhpcy5jYWxsKG1lc3NhZ2VzLCBvcHRpb25zLCBjYWxsYmFja3MpO1xuICAgIH1cbiAgICBhc3luYyBwcmVkaWN0KHRleHQsIG9wdGlvbnMsIGNhbGxiYWNrcykge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gbmV3IEh1bWFuQ2hhdE1lc3NhZ2UodGV4dCk7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuY2FsbChbbWVzc2FnZV0sIG9wdGlvbnMsIGNhbGxiYWNrcyk7XG4gICAgICAgIHJldHVybiByZXN1bHQudGV4dDtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgU2ltcGxlQ2hhdE1vZGVsIGV4dGVuZHMgQmFzZUNoYXRNb2RlbCB7XG4gICAgYXN5bmMgX2dlbmVyYXRlKG1lc3NhZ2VzLCBvcHRpb25zLCBydW5NYW5hZ2VyKSB7XG4gICAgICAgIGNvbnN0IHRleHQgPSBhd2FpdCB0aGlzLl9jYWxsKG1lc3NhZ2VzLCBvcHRpb25zLCBydW5NYW5hZ2VyKTtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IG5ldyBBSUNoYXRNZXNzYWdlKHRleHQpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZ2VuZXJhdGlvbnM6IFtcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHRleHQ6IG1lc3NhZ2UudGV4dCxcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgXSxcbiAgICAgICAgfTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBDb25maWd1cmF0aW9uLCBPcGVuQUlBcGksIH0gZnJvbSBcIm9wZW5haVwiO1xuaW1wb3J0IHsgZ2V0RW52aXJvbm1lbnRWYXJpYWJsZSwgaXNOb2RlIH0gZnJvbSBcIi4uL3V0aWwvZW52LmpzXCI7XG5pbXBvcnQgZmV0Y2hBZGFwdGVyIGZyb20gXCIuLi91dGlsL2F4aW9zLWZldGNoLWFkYXB0ZXIuanNcIjtcbmltcG9ydCB7IEJhc2VDaGF0TW9kZWwgfSBmcm9tIFwiLi9iYXNlLmpzXCI7XG5pbXBvcnQgeyBBSUNoYXRNZXNzYWdlLCBDaGF0TWVzc2FnZSwgSHVtYW5DaGF0TWVzc2FnZSwgU3lzdGVtQ2hhdE1lc3NhZ2UsIH0gZnJvbSBcIi4uL3NjaGVtYS9pbmRleC5qc1wiO1xuaW1wb3J0IHsgZ2V0TW9kZWxOYW1lRm9yVGlrdG9rZW4gfSBmcm9tIFwiLi4vYmFzZV9sYW5ndWFnZS9jb3VudF90b2tlbnMuanNcIjtcbmltcG9ydCB7IHByb21wdExheWVyVHJhY2tSZXF1ZXN0IH0gZnJvbSBcIi4uL3V0aWwvcHJvbXB0LWxheWVyLmpzXCI7XG5mdW5jdGlvbiBtZXNzYWdlVHlwZVRvT3BlbkFJUm9sZSh0eXBlKSB7XG4gICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgIGNhc2UgXCJzeXN0ZW1cIjpcbiAgICAgICAgICAgIHJldHVybiBcInN5c3RlbVwiO1xuICAgICAgICBjYXNlIFwiYWlcIjpcbiAgICAgICAgICAgIHJldHVybiBcImFzc2lzdGFudFwiO1xuICAgICAgICBjYXNlIFwiaHVtYW5cIjpcbiAgICAgICAgICAgIHJldHVybiBcInVzZXJcIjtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5rbm93biBtZXNzYWdlIHR5cGU6ICR7dHlwZX1gKTtcbiAgICB9XG59XG5mdW5jdGlvbiBvcGVuQUlSZXNwb25zZVRvQ2hhdE1lc3NhZ2Uocm9sZSwgdGV4dCkge1xuICAgIHN3aXRjaCAocm9sZSkge1xuICAgICAgICBjYXNlIFwidXNlclwiOlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBIdW1hbkNoYXRNZXNzYWdlKHRleHQpO1xuICAgICAgICBjYXNlIFwiYXNzaXN0YW50XCI6XG4gICAgICAgICAgICByZXR1cm4gbmV3IEFJQ2hhdE1lc3NhZ2UodGV4dCk7XG4gICAgICAgIGNhc2UgXCJzeXN0ZW1cIjpcbiAgICAgICAgICAgIHJldHVybiBuZXcgU3lzdGVtQ2hhdE1lc3NhZ2UodGV4dCk7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gbmV3IENoYXRNZXNzYWdlKHRleHQsIHJvbGUgPz8gXCJ1bmtub3duXCIpO1xuICAgIH1cbn1cbi8qKlxuICogV3JhcHBlciBhcm91bmQgT3BlbkFJIGxhcmdlIGxhbmd1YWdlIG1vZGVscyB0aGF0IHVzZSB0aGUgQ2hhdCBlbmRwb2ludC5cbiAqXG4gKiBUbyB1c2UgeW91IHNob3VsZCBoYXZlIHRoZSBgb3BlbmFpYCBwYWNrYWdlIGluc3RhbGxlZCwgd2l0aCB0aGVcbiAqIGBPUEVOQUlfQVBJX0tFWWAgZW52aXJvbm1lbnQgdmFyaWFibGUgc2V0LlxuICpcbiAqIFRvIHVzZSB3aXRoIEF6dXJlIHlvdSBzaG91bGQgaGF2ZSB0aGUgYG9wZW5haWAgcGFja2FnZSBpbnN0YWxsZWQsIHdpdGggdGhlXG4gKiBgQVpVUkVfT1BFTkFJX0FQSV9LRVlgLFxuICogYEFaVVJFX09QRU5BSV9BUElfSU5TVEFOQ0VfTkFNRWAsXG4gKiBgQVpVUkVfT1BFTkFJX0FQSV9ERVBMT1lNRU5UX05BTUVgXG4gKiBhbmQgYEFaVVJFX09QRU5BSV9BUElfVkVSU0lPTmAgZW52aXJvbm1lbnQgdmFyaWFibGUgc2V0LlxuICpcbiAqIEByZW1hcmtzXG4gKiBBbnkgcGFyYW1ldGVycyB0aGF0IGFyZSB2YWxpZCB0byBiZSBwYXNzZWQgdG8ge0BsaW5rXG4gKiBodHRwczovL3BsYXRmb3JtLm9wZW5haS5jb20vZG9jcy9hcGktcmVmZXJlbmNlL2NoYXQvY3JlYXRlIHxcbiAqIGBvcGVuYWkuY3JlYXRlQ29tcGxldGlvbmB9IGNhbiBiZSBwYXNzZWQgdGhyb3VnaCB7QGxpbmsgbW9kZWxLd2FyZ3N9LCBldmVuXG4gKiBpZiBub3QgZXhwbGljaXRseSBhdmFpbGFibGUgb24gdGhpcyBjbGFzcy5cbiAqL1xuZXhwb3J0IGNsYXNzIENoYXRPcGVuQUkgZXh0ZW5kcyBCYXNlQ2hhdE1vZGVsIHtcbiAgICBnZXQgY2FsbEtleXMoKSB7XG4gICAgICAgIHJldHVybiBbXCJzdG9wXCIsIFwic2lnbmFsXCIsIFwidGltZW91dFwiLCBcIm9wdGlvbnNcIl07XG4gICAgfVxuICAgIGNvbnN0cnVjdG9yKGZpZWxkcywgY29uZmlndXJhdGlvbikge1xuICAgICAgICBzdXBlcihmaWVsZHMgPz8ge30pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgXCJ0ZW1wZXJhdHVyZVwiLCB7XG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgICAgICB2YWx1ZTogMVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIFwidG9wUFwiLCB7XG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgICAgICB2YWx1ZTogMVxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIFwiZnJlcXVlbmN5UGVuYWx0eVwiLCB7XG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgICAgICB2YWx1ZTogMFxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIFwicHJlc2VuY2VQZW5hbHR5XCIsIHtcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIHZhbHVlOiAwXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgXCJuXCIsIHtcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIHZhbHVlOiAxXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgXCJsb2dpdEJpYXNcIiwge1xuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgdmFsdWU6IHZvaWQgMFxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIFwibW9kZWxOYW1lXCIsIHtcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIHZhbHVlOiBcImdwdC0zLjUtdHVyYm9cIlxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIFwibW9kZWxLd2FyZ3NcIiwge1xuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgdmFsdWU6IHZvaWQgMFxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIFwic3RvcFwiLCB7XG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgICAgICB2YWx1ZTogdm9pZCAwXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgXCJ0aW1lb3V0XCIsIHtcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIHZhbHVlOiB2b2lkIDBcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBcInN0cmVhbWluZ1wiLCB7XG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgICAgICB2YWx1ZTogZmFsc2VcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBcIm1heFRva2Vuc1wiLCB7XG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgICAgICB2YWx1ZTogdm9pZCAwXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgXCJhenVyZU9wZW5BSUFwaVZlcnNpb25cIiwge1xuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgdmFsdWU6IHZvaWQgMFxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIFwiYXp1cmVPcGVuQUlBcGlLZXlcIiwge1xuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgdmFsdWU6IHZvaWQgMFxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIFwiYXp1cmVPcGVuQUlBcGlJbnN0YW5jZU5hbWVcIiwge1xuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgdmFsdWU6IHZvaWQgMFxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIFwiYXp1cmVPcGVuQUlBcGlEZXBsb3ltZW50TmFtZVwiLCB7XG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgICAgICB2YWx1ZTogdm9pZCAwXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgXCJjbGllbnRcIiwge1xuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgdmFsdWU6IHZvaWQgMFxuICAgICAgICB9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIFwiY2xpZW50Q29uZmlnXCIsIHtcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIHZhbHVlOiB2b2lkIDBcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IGFwaUtleSA9IGZpZWxkcz8ub3BlbkFJQXBpS2V5ID8/IGdldEVudmlyb25tZW50VmFyaWFibGUoXCJPUEVOQUlfQVBJX0tFWVwiKTtcbiAgICAgICAgY29uc3QgYXp1cmVBcGlLZXkgPSBmaWVsZHM/LmF6dXJlT3BlbkFJQXBpS2V5ID8/XG4gICAgICAgICAgICBnZXRFbnZpcm9ubWVudFZhcmlhYmxlKFwiQVpVUkVfT1BFTkFJX0FQSV9LRVlcIik7XG4gICAgICAgIGlmICghYXp1cmVBcGlLZXkgJiYgIWFwaUtleSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiKEF6dXJlKSBPcGVuQUkgQVBJIGtleSBub3QgZm91bmRcIik7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgYXp1cmVBcGlJbnN0YW5jZU5hbWUgPSBmaWVsZHM/LmF6dXJlT3BlbkFJQXBpSW5zdGFuY2VOYW1lID8/XG4gICAgICAgICAgICBnZXRFbnZpcm9ubWVudFZhcmlhYmxlKFwiQVpVUkVfT1BFTkFJX0FQSV9JTlNUQU5DRV9OQU1FXCIpO1xuICAgICAgICBjb25zdCBhenVyZUFwaURlcGxveW1lbnROYW1lID0gZmllbGRzPy5henVyZU9wZW5BSUFwaURlcGxveW1lbnROYW1lID8/XG4gICAgICAgICAgICBnZXRFbnZpcm9ubWVudFZhcmlhYmxlKFwiQVpVUkVfT1BFTkFJX0FQSV9ERVBMT1lNRU5UX05BTUVcIik7XG4gICAgICAgIGNvbnN0IGF6dXJlQXBpVmVyc2lvbiA9IGZpZWxkcz8uYXp1cmVPcGVuQUlBcGlWZXJzaW9uID8/XG4gICAgICAgICAgICBnZXRFbnZpcm9ubWVudFZhcmlhYmxlKFwiQVpVUkVfT1BFTkFJX0FQSV9WRVJTSU9OXCIpO1xuICAgICAgICB0aGlzLm1vZGVsTmFtZSA9IGZpZWxkcz8ubW9kZWxOYW1lID8/IHRoaXMubW9kZWxOYW1lO1xuICAgICAgICB0aGlzLm1vZGVsS3dhcmdzID0gZmllbGRzPy5tb2RlbEt3YXJncyA/PyB7fTtcbiAgICAgICAgdGhpcy50aW1lb3V0ID0gZmllbGRzPy50aW1lb3V0O1xuICAgICAgICB0aGlzLnRlbXBlcmF0dXJlID0gZmllbGRzPy50ZW1wZXJhdHVyZSA/PyB0aGlzLnRlbXBlcmF0dXJlO1xuICAgICAgICB0aGlzLnRvcFAgPSBmaWVsZHM/LnRvcFAgPz8gdGhpcy50b3BQO1xuICAgICAgICB0aGlzLmZyZXF1ZW5jeVBlbmFsdHkgPSBmaWVsZHM/LmZyZXF1ZW5jeVBlbmFsdHkgPz8gdGhpcy5mcmVxdWVuY3lQZW5hbHR5O1xuICAgICAgICB0aGlzLnByZXNlbmNlUGVuYWx0eSA9IGZpZWxkcz8ucHJlc2VuY2VQZW5hbHR5ID8/IHRoaXMucHJlc2VuY2VQZW5hbHR5O1xuICAgICAgICB0aGlzLm1heFRva2VucyA9IGZpZWxkcz8ubWF4VG9rZW5zO1xuICAgICAgICB0aGlzLm4gPSBmaWVsZHM/Lm4gPz8gdGhpcy5uO1xuICAgICAgICB0aGlzLmxvZ2l0QmlhcyA9IGZpZWxkcz8ubG9naXRCaWFzO1xuICAgICAgICB0aGlzLnN0b3AgPSBmaWVsZHM/LnN0b3A7XG4gICAgICAgIHRoaXMuc3RyZWFtaW5nID0gZmllbGRzPy5zdHJlYW1pbmcgPz8gZmFsc2U7XG4gICAgICAgIHRoaXMuYXp1cmVPcGVuQUlBcGlWZXJzaW9uID0gYXp1cmVBcGlWZXJzaW9uO1xuICAgICAgICB0aGlzLmF6dXJlT3BlbkFJQXBpS2V5ID0gYXp1cmVBcGlLZXk7XG4gICAgICAgIHRoaXMuYXp1cmVPcGVuQUlBcGlJbnN0YW5jZU5hbWUgPSBhenVyZUFwaUluc3RhbmNlTmFtZTtcbiAgICAgICAgdGhpcy5henVyZU9wZW5BSUFwaURlcGxveW1lbnROYW1lID0gYXp1cmVBcGlEZXBsb3ltZW50TmFtZTtcbiAgICAgICAgaWYgKHRoaXMuc3RyZWFtaW5nICYmIHRoaXMubiA+IDEpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCBzdHJlYW0gcmVzdWx0cyB3aGVuIG4gPiAxXCIpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmF6dXJlT3BlbkFJQXBpS2V5KSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuYXp1cmVPcGVuQUlBcGlJbnN0YW5jZU5hbWUpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJBenVyZSBPcGVuQUkgQVBJIGluc3RhbmNlIG5hbWUgbm90IGZvdW5kXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCF0aGlzLmF6dXJlT3BlbkFJQXBpRGVwbG95bWVudE5hbWUpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJBenVyZSBPcGVuQUkgQVBJIGRlcGxveW1lbnQgbmFtZSBub3QgZm91bmRcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIXRoaXMuYXp1cmVPcGVuQUlBcGlWZXJzaW9uKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQXp1cmUgT3BlbkFJIEFQSSB2ZXJzaW9uIG5vdCBmb3VuZFwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNsaWVudENvbmZpZyA9IHtcbiAgICAgICAgICAgIGFwaUtleSxcbiAgICAgICAgICAgIC4uLmNvbmZpZ3VyYXRpb24sXG4gICAgICAgIH07XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgcGFyYW1ldGVycyB1c2VkIHRvIGludm9rZSB0aGUgbW9kZWxcbiAgICAgKi9cbiAgICBpbnZvY2F0aW9uUGFyYW1zKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbW9kZWw6IHRoaXMubW9kZWxOYW1lLFxuICAgICAgICAgICAgdGVtcGVyYXR1cmU6IHRoaXMudGVtcGVyYXR1cmUsXG4gICAgICAgICAgICB0b3BfcDogdGhpcy50b3BQLFxuICAgICAgICAgICAgZnJlcXVlbmN5X3BlbmFsdHk6IHRoaXMuZnJlcXVlbmN5UGVuYWx0eSxcbiAgICAgICAgICAgIHByZXNlbmNlX3BlbmFsdHk6IHRoaXMucHJlc2VuY2VQZW5hbHR5LFxuICAgICAgICAgICAgbWF4X3Rva2VuczogdGhpcy5tYXhUb2tlbnMgPT09IC0xID8gdW5kZWZpbmVkIDogdGhpcy5tYXhUb2tlbnMsXG4gICAgICAgICAgICBuOiB0aGlzLm4sXG4gICAgICAgICAgICBsb2dpdF9iaWFzOiB0aGlzLmxvZ2l0QmlhcyxcbiAgICAgICAgICAgIHN0b3A6IHRoaXMuc3RvcCxcbiAgICAgICAgICAgIHN0cmVhbTogdGhpcy5zdHJlYW1pbmcsXG4gICAgICAgICAgICAuLi50aGlzLm1vZGVsS3dhcmdzLFxuICAgICAgICB9O1xuICAgIH1cbiAgICAvKiogQGlnbm9yZSAqL1xuICAgIF9pZGVudGlmeWluZ1BhcmFtcygpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIG1vZGVsX25hbWU6IHRoaXMubW9kZWxOYW1lLFxuICAgICAgICAgICAgLi4udGhpcy5pbnZvY2F0aW9uUGFyYW1zKCksXG4gICAgICAgICAgICAuLi50aGlzLmNsaWVudENvbmZpZyxcbiAgICAgICAgfTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBpZGVudGlmeWluZyBwYXJhbWV0ZXJzIGZvciB0aGUgbW9kZWxcbiAgICAgKi9cbiAgICBpZGVudGlmeWluZ1BhcmFtcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2lkZW50aWZ5aW5nUGFyYW1zKCk7XG4gICAgfVxuICAgIC8qKiBAaWdub3JlICovXG4gICAgYXN5bmMgX2dlbmVyYXRlKG1lc3NhZ2VzLCBvcHRpb25zLCBydW5NYW5hZ2VyKSB7XG4gICAgICAgIGNvbnN0IHRva2VuVXNhZ2UgPSB7fTtcbiAgICAgICAgaWYgKHRoaXMuc3RvcCAmJiBvcHRpb25zPy5zdG9wKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTdG9wIGZvdW5kIGluIGlucHV0IGFuZCBkZWZhdWx0IHBhcmFtc1wiKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwYXJhbXMgPSB0aGlzLmludm9jYXRpb25QYXJhbXMoKTtcbiAgICAgICAgcGFyYW1zLnN0b3AgPSBvcHRpb25zPy5zdG9wID8/IHBhcmFtcy5zdG9wO1xuICAgICAgICBjb25zdCBtZXNzYWdlc01hcHBlZCA9IG1lc3NhZ2VzLm1hcCgobWVzc2FnZSkgPT4gKHtcbiAgICAgICAgICAgIHJvbGU6IG1lc3NhZ2VUeXBlVG9PcGVuQUlSb2xlKG1lc3NhZ2UuX2dldFR5cGUoKSksXG4gICAgICAgICAgICBjb250ZW50OiBtZXNzYWdlLnRleHQsXG4gICAgICAgICAgICBuYW1lOiBtZXNzYWdlLm5hbWUsXG4gICAgICAgIH0pKTtcbiAgICAgICAgY29uc3QgZGF0YSA9IHBhcmFtcy5zdHJlYW1cbiAgICAgICAgICAgID8gYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgICAgIGxldCByZXNwb25zZTtcbiAgICAgICAgICAgICAgICBsZXQgcmVqZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBsZXQgcmVzb2x2ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbXBsZXRpb25XaXRoUmV0cnkoe1xuICAgICAgICAgICAgICAgICAgICAuLi5wYXJhbXMsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2VzOiBtZXNzYWdlc01hcHBlZCxcbiAgICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgICAgIHNpZ25hbDogb3B0aW9ucz8uc2lnbmFsLFxuICAgICAgICAgICAgICAgICAgICAuLi5vcHRpb25zPy5vcHRpb25zLFxuICAgICAgICAgICAgICAgICAgICBhZGFwdGVyOiBmZXRjaEFkYXB0ZXIsXG4gICAgICAgICAgICAgICAgICAgIHJlc3BvbnNlVHlwZTogXCJzdHJlYW1cIixcbiAgICAgICAgICAgICAgICAgICAgb25tZXNzYWdlOiAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChldmVudC5kYXRhPy50cmltPy4oKSA9PT0gXCJbRE9ORV1cIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXNvbHZlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBKU09OLnBhcnNlKGV2ZW50LmRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG9uIHRoZSBmaXJzdCBtZXNzYWdlIHNldCB0aGUgcmVzcG9uc2UgcHJvcGVydGllc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghcmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2UgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogbWVzc2FnZS5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9iamVjdDogbWVzc2FnZS5vYmplY3QsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjcmVhdGVkOiBtZXNzYWdlLmNyZWF0ZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2RlbDogbWVzc2FnZS5tb2RlbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNob2ljZXM6IFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBvbiBhbGwgbWVzc2FnZXMsIHVwZGF0ZSBjaG9pY2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHBhcnQgb2YgbWVzc2FnZS5jaG9pY2VzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwYXJ0ICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBjaG9pY2UgPSByZXNwb25zZS5jaG9pY2VzLmZpbmQoKGMpID0+IGMuaW5kZXggPT09IHBhcnQuaW5kZXgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFjaG9pY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaG9pY2UgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4OiBwYXJ0LmluZGV4LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaW5pc2hfcmVhc29uOiBwYXJ0LmZpbmlzaF9yZWFzb24gPz8gdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2UuY2hvaWNlc1twYXJ0LmluZGV4XSA9IGNob2ljZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghY2hvaWNlLm1lc3NhZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaG9pY2UubWVzc2FnZSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9sZTogcGFydC5kZWx0YVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPy5yb2xlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50OiBwYXJ0LmRlbHRhPy5jb250ZW50ID8/IFwiXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNob2ljZS5tZXNzYWdlLmNvbnRlbnQgKz0gcGFydC5kZWx0YT8uY29udGVudCA/PyBcIlwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVE9ETyB0aGlzIHNob3VsZCBwYXNzIHBhcnQuaW5kZXggdG8gdGhlIGNhbGxiYWNrXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB3aGVuIHRoYXQncyBzdXBwb3J0ZWQgdGhlcmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby12b2lkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2b2lkIHJ1bk1hbmFnZXI/LmhhbmRsZUxMTU5ld1Rva2VuKHBhcnQuZGVsdGE/LmNvbnRlbnQgPz8gXCJcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gd2hlbiBhbGwgbWVzc2FnZXMgYXJlIGZpbmlzaGVkLCByZXNvbHZlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFyZXNvbHZlZCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlLmNob2ljZXMuZXZlcnkoKGMpID0+IGMuZmluaXNoX3JlYXNvbiAhPSBudWxsKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9KS5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFyZWplY3RlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIDogYXdhaXQgdGhpcy5jb21wbGV0aW9uV2l0aFJldHJ5KHtcbiAgICAgICAgICAgICAgICAuLi5wYXJhbXMsXG4gICAgICAgICAgICAgICAgbWVzc2FnZXM6IG1lc3NhZ2VzTWFwcGVkLFxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIHNpZ25hbDogb3B0aW9ucz8uc2lnbmFsLFxuICAgICAgICAgICAgICAgIC4uLm9wdGlvbnM/Lm9wdGlvbnMsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgeyBjb21wbGV0aW9uX3Rva2VuczogY29tcGxldGlvblRva2VucywgcHJvbXB0X3Rva2VuczogcHJvbXB0VG9rZW5zLCB0b3RhbF90b2tlbnM6IHRvdGFsVG9rZW5zLCB9ID0gZGF0YS51c2FnZSA/PyB7fTtcbiAgICAgICAgaWYgKGNvbXBsZXRpb25Ub2tlbnMpIHtcbiAgICAgICAgICAgIHRva2VuVXNhZ2UuY29tcGxldGlvblRva2VucyA9XG4gICAgICAgICAgICAgICAgKHRva2VuVXNhZ2UuY29tcGxldGlvblRva2VucyA/PyAwKSArIGNvbXBsZXRpb25Ub2tlbnM7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHByb21wdFRva2Vucykge1xuICAgICAgICAgICAgdG9rZW5Vc2FnZS5wcm9tcHRUb2tlbnMgPSAodG9rZW5Vc2FnZS5wcm9tcHRUb2tlbnMgPz8gMCkgKyBwcm9tcHRUb2tlbnM7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRvdGFsVG9rZW5zKSB7XG4gICAgICAgICAgICB0b2tlblVzYWdlLnRvdGFsVG9rZW5zID0gKHRva2VuVXNhZ2UudG90YWxUb2tlbnMgPz8gMCkgKyB0b3RhbFRva2VucztcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBnZW5lcmF0aW9ucyA9IFtdO1xuICAgICAgICBmb3IgKGNvbnN0IHBhcnQgb2YgZGF0YS5jaG9pY2VzKSB7XG4gICAgICAgICAgICBjb25zdCByb2xlID0gcGFydC5tZXNzYWdlPy5yb2xlID8/IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIGNvbnN0IHRleHQgPSBwYXJ0Lm1lc3NhZ2U/LmNvbnRlbnQgPz8gXCJcIjtcbiAgICAgICAgICAgIGdlbmVyYXRpb25zLnB1c2goe1xuICAgICAgICAgICAgICAgIHRleHQsXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogb3BlbkFJUmVzcG9uc2VUb0NoYXRNZXNzYWdlKHJvbGUsIHRleHQpLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGdlbmVyYXRpb25zLFxuICAgICAgICAgICAgbGxtT3V0cHV0OiB7IHRva2VuVXNhZ2UgfSxcbiAgICAgICAgfTtcbiAgICB9XG4gICAgYXN5bmMgZ2V0TnVtVG9rZW5zRnJvbU1lc3NhZ2VzKG1lc3NhZ2VzKSB7XG4gICAgICAgIGxldCB0b3RhbENvdW50ID0gMDtcbiAgICAgICAgbGV0IHRva2Vuc1Blck1lc3NhZ2UgPSAwO1xuICAgICAgICBsZXQgdG9rZW5zUGVyTmFtZSA9IDA7XG4gICAgICAgIC8vIEZyb206IGh0dHBzOi8vZ2l0aHViLmNvbS9vcGVuYWkvb3BlbmFpLWNvb2tib29rL2Jsb2IvbWFpbi9leGFtcGxlcy9Ib3dfdG9fZm9ybWF0X2lucHV0c190b19DaGF0R1BUX21vZGVscy5pcHluYlxuICAgICAgICBpZiAoZ2V0TW9kZWxOYW1lRm9yVGlrdG9rZW4odGhpcy5tb2RlbE5hbWUpID09PSBcImdwdC0zLjUtdHVyYm9cIikge1xuICAgICAgICAgICAgdG9rZW5zUGVyTWVzc2FnZSA9IDQ7XG4gICAgICAgICAgICB0b2tlbnNQZXJOYW1lID0gLTE7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZ2V0TW9kZWxOYW1lRm9yVGlrdG9rZW4odGhpcy5tb2RlbE5hbWUpLnN0YXJ0c1dpdGgoXCJncHQtNFwiKSkge1xuICAgICAgICAgICAgdG9rZW5zUGVyTWVzc2FnZSA9IDM7XG4gICAgICAgICAgICB0b2tlbnNQZXJOYW1lID0gMTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBjb3VudFBlck1lc3NhZ2UgPSBhd2FpdCBQcm9taXNlLmFsbChtZXNzYWdlcy5tYXAoYXN5bmMgKG1lc3NhZ2UpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHRleHRDb3VudCA9IGF3YWl0IHRoaXMuZ2V0TnVtVG9rZW5zKG1lc3NhZ2UudGV4dCk7XG4gICAgICAgICAgICBjb25zdCByb2xlQ291bnQgPSBhd2FpdCB0aGlzLmdldE51bVRva2VucyhtZXNzYWdlVHlwZVRvT3BlbkFJUm9sZShtZXNzYWdlLl9nZXRUeXBlKCkpKTtcbiAgICAgICAgICAgIGNvbnN0IG5hbWVDb3VudCA9IG1lc3NhZ2UubmFtZSAhPT0gdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgPyB0b2tlbnNQZXJOYW1lICsgKGF3YWl0IHRoaXMuZ2V0TnVtVG9rZW5zKG1lc3NhZ2UubmFtZSkpXG4gICAgICAgICAgICAgICAgOiAwO1xuICAgICAgICAgICAgY29uc3QgY291bnQgPSB0ZXh0Q291bnQgKyB0b2tlbnNQZXJNZXNzYWdlICsgcm9sZUNvdW50ICsgbmFtZUNvdW50O1xuICAgICAgICAgICAgdG90YWxDb3VudCArPSBjb3VudDtcbiAgICAgICAgICAgIHJldHVybiBjb3VudDtcbiAgICAgICAgfSkpO1xuICAgICAgICB0b3RhbENvdW50ICs9IDM7IC8vIGV2ZXJ5IHJlcGx5IGlzIHByaW1lZCB3aXRoIDx8c3RhcnR8PmFzc2lzdGFudDx8bWVzc2FnZXw+XG4gICAgICAgIHJldHVybiB7IHRvdGFsQ291bnQsIGNvdW50UGVyTWVzc2FnZSB9O1xuICAgIH1cbiAgICAvKiogQGlnbm9yZSAqL1xuICAgIGFzeW5jIGNvbXBsZXRpb25XaXRoUmV0cnkocmVxdWVzdCwgb3B0aW9ucykge1xuICAgICAgICBpZiAoIXRoaXMuY2xpZW50KSB7XG4gICAgICAgICAgICBjb25zdCBlbmRwb2ludCA9IHRoaXMuYXp1cmVPcGVuQUlBcGlLZXlcbiAgICAgICAgICAgICAgICA/IGBodHRwczovLyR7dGhpcy5henVyZU9wZW5BSUFwaUluc3RhbmNlTmFtZX0ub3BlbmFpLmF6dXJlLmNvbS9vcGVuYWkvZGVwbG95bWVudHMvJHt0aGlzLmF6dXJlT3BlbkFJQXBpRGVwbG95bWVudE5hbWV9YFxuICAgICAgICAgICAgICAgIDogdGhpcy5jbGllbnRDb25maWcuYmFzZVBhdGg7XG4gICAgICAgICAgICBjb25zdCBjbGllbnRDb25maWcgPSBuZXcgQ29uZmlndXJhdGlvbih7XG4gICAgICAgICAgICAgICAgLi4udGhpcy5jbGllbnRDb25maWcsXG4gICAgICAgICAgICAgICAgYmFzZVBhdGg6IGVuZHBvaW50LFxuICAgICAgICAgICAgICAgIGJhc2VPcHRpb25zOiB7XG4gICAgICAgICAgICAgICAgICAgIHRpbWVvdXQ6IHRoaXMudGltZW91dCxcbiAgICAgICAgICAgICAgICAgICAgLi4udGhpcy5jbGllbnRDb25maWcuYmFzZU9wdGlvbnMsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5jbGllbnQgPSBuZXcgT3BlbkFJQXBpKGNsaWVudENvbmZpZyk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgYXhpb3NPcHRpb25zID0ge1xuICAgICAgICAgICAgYWRhcHRlcjogaXNOb2RlKCkgPyB1bmRlZmluZWQgOiBmZXRjaEFkYXB0ZXIsXG4gICAgICAgICAgICAuLi50aGlzLmNsaWVudENvbmZpZy5iYXNlT3B0aW9ucyxcbiAgICAgICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIH07XG4gICAgICAgIGlmICh0aGlzLmF6dXJlT3BlbkFJQXBpS2V5KSB7XG4gICAgICAgICAgICBheGlvc09wdGlvbnMuaGVhZGVycyA9IHtcbiAgICAgICAgICAgICAgICBcImFwaS1rZXlcIjogdGhpcy5henVyZU9wZW5BSUFwaUtleSxcbiAgICAgICAgICAgICAgICAuLi5heGlvc09wdGlvbnMuaGVhZGVycyxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBheGlvc09wdGlvbnMucGFyYW1zID0ge1xuICAgICAgICAgICAgICAgIFwiYXBpLXZlcnNpb25cIjogdGhpcy5henVyZU9wZW5BSUFwaVZlcnNpb24sXG4gICAgICAgICAgICAgICAgLi4uYXhpb3NPcHRpb25zLnBhcmFtcyxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuY2FsbGVyXG4gICAgICAgICAgICAuY2FsbCh0aGlzLmNsaWVudC5jcmVhdGVDaGF0Q29tcGxldGlvbi5iaW5kKHRoaXMuY2xpZW50KSwgcmVxdWVzdCwgYXhpb3NPcHRpb25zKVxuICAgICAgICAgICAgLnRoZW4oKHJlcykgPT4gcmVzLmRhdGEpO1xuICAgIH1cbiAgICBfbGxtVHlwZSgpIHtcbiAgICAgICAgcmV0dXJuIFwib3BlbmFpXCI7XG4gICAgfVxuICAgIC8qKiBAaWdub3JlICovXG4gICAgX2NvbWJpbmVMTE1PdXRwdXQoLi4ubGxtT3V0cHV0cykge1xuICAgICAgICByZXR1cm4gbGxtT3V0cHV0cy5yZWR1Y2UoKGFjYywgbGxtT3V0cHV0KSA9PiB7XG4gICAgICAgICAgICBpZiAobGxtT3V0cHV0ICYmIGxsbU91dHB1dC50b2tlblVzYWdlKSB7XG4gICAgICAgICAgICAgICAgYWNjLnRva2VuVXNhZ2UuY29tcGxldGlvblRva2VucyArPVxuICAgICAgICAgICAgICAgICAgICBsbG1PdXRwdXQudG9rZW5Vc2FnZS5jb21wbGV0aW9uVG9rZW5zID8/IDA7XG4gICAgICAgICAgICAgICAgYWNjLnRva2VuVXNhZ2UucHJvbXB0VG9rZW5zICs9IGxsbU91dHB1dC50b2tlblVzYWdlLnByb21wdFRva2VucyA/PyAwO1xuICAgICAgICAgICAgICAgIGFjYy50b2tlblVzYWdlLnRvdGFsVG9rZW5zICs9IGxsbU91dHB1dC50b2tlblVzYWdlLnRvdGFsVG9rZW5zID8/IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYWNjO1xuICAgICAgICB9LCB7XG4gICAgICAgICAgICB0b2tlblVzYWdlOiB7XG4gICAgICAgICAgICAgICAgY29tcGxldGlvblRva2VuczogMCxcbiAgICAgICAgICAgICAgICBwcm9tcHRUb2tlbnM6IDAsXG4gICAgICAgICAgICAgICAgdG90YWxUb2tlbnM6IDAsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICB9XG59XG5leHBvcnQgY2xhc3MgUHJvbXB0TGF5ZXJDaGF0T3BlbkFJIGV4dGVuZHMgQ2hhdE9wZW5BSSB7XG4gICAgY29uc3RydWN0b3IoZmllbGRzKSB7XG4gICAgICAgIHN1cGVyKGZpZWxkcyk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBcInByb21wdExheWVyQXBpS2V5XCIsIHtcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIHZhbHVlOiB2b2lkIDBcbiAgICAgICAgfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBcInBsVGFnc1wiLCB7XG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgICAgICB2YWx1ZTogdm9pZCAwXG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgXCJyZXR1cm5Qcm9tcHRMYXllcklkXCIsIHtcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIHZhbHVlOiB2b2lkIDBcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMucHJvbXB0TGF5ZXJBcGlLZXkgPVxuICAgICAgICAgICAgZmllbGRzPy5wcm9tcHRMYXllckFwaUtleSA/P1xuICAgICAgICAgICAgICAgICh0eXBlb2YgcHJvY2VzcyAhPT0gXCJ1bmRlZmluZWRcIlxuICAgICAgICAgICAgICAgICAgICA/IC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1wcm9jZXNzLWVudlxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvY2Vzcy5lbnY/LlBST01QVExBWUVSX0FQSV9LRVlcbiAgICAgICAgICAgICAgICAgICAgOiB1bmRlZmluZWQpO1xuICAgICAgICB0aGlzLnBsVGFncyA9IGZpZWxkcz8ucGxUYWdzID8/IFtdO1xuICAgICAgICB0aGlzLnJldHVyblByb21wdExheWVySWQgPSBmaWVsZHM/LnJldHVyblByb21wdExheWVySWQgPz8gZmFsc2U7XG4gICAgfVxuICAgIGFzeW5jIF9nZW5lcmF0ZShtZXNzYWdlcywgb3B0aW9ucywgcnVuTWFuYWdlcikge1xuICAgICAgICBjb25zdCByZXF1ZXN0U3RhcnRUaW1lID0gRGF0ZS5ub3coKTtcbiAgICAgICAgbGV0IHBhcnNlZE9wdGlvbnM7XG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KG9wdGlvbnMpKSB7XG4gICAgICAgICAgICBwYXJzZWRPcHRpb25zID0geyBzdG9wOiBvcHRpb25zIH07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAob3B0aW9ucz8udGltZW91dCAmJiAhb3B0aW9ucy5zaWduYWwpIHtcbiAgICAgICAgICAgIHBhcnNlZE9wdGlvbnMgPSB7XG4gICAgICAgICAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgICAgICAgICBzaWduYWw6IEFib3J0U2lnbmFsLnRpbWVvdXQob3B0aW9ucy50aW1lb3V0KSxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBwYXJzZWRPcHRpb25zID0gb3B0aW9ucyA/PyB7fTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBnZW5lcmF0ZWRSZXNwb25zZXMgPSBhd2FpdCBzdXBlci5fZ2VuZXJhdGUobWVzc2FnZXMsIHBhcnNlZE9wdGlvbnMsIHJ1bk1hbmFnZXIpO1xuICAgICAgICBjb25zdCByZXF1ZXN0RW5kVGltZSA9IERhdGUubm93KCk7XG4gICAgICAgIGNvbnN0IF9jb252ZXJ0TWVzc2FnZVRvRGljdCA9IChtZXNzYWdlKSA9PiB7XG4gICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICAgICAgICAgICAgbGV0IG1lc3NhZ2VEaWN0O1xuICAgICAgICAgICAgaWYgKG1lc3NhZ2UuX2dldFR5cGUoKSA9PT0gXCJodW1hblwiKSB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZURpY3QgPSB7IHJvbGU6IFwidXNlclwiLCBjb250ZW50OiBtZXNzYWdlLnRleHQgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKG1lc3NhZ2UuX2dldFR5cGUoKSA9PT0gXCJhaVwiKSB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZURpY3QgPSB7IHJvbGU6IFwiYXNzaXN0YW50XCIsIGNvbnRlbnQ6IG1lc3NhZ2UudGV4dCB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAobWVzc2FnZS5fZ2V0VHlwZSgpID09PSBcInN5c3RlbVwiKSB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZURpY3QgPSB7IHJvbGU6IFwic3lzdGVtXCIsIGNvbnRlbnQ6IG1lc3NhZ2UudGV4dCB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAobWVzc2FnZS5fZ2V0VHlwZSgpID09PSBcImdlbmVyaWNcIikge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2VEaWN0ID0ge1xuICAgICAgICAgICAgICAgICAgICByb2xlOiBtZXNzYWdlLnJvbGUsXG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IG1lc3NhZ2UudGV4dCxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBHb3QgdW5rbm93biB0eXBlICR7bWVzc2FnZX1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBtZXNzYWdlRGljdDtcbiAgICAgICAgfTtcbiAgICAgICAgY29uc3QgX2NyZWF0ZU1lc3NhZ2VEaWN0cyA9IChtZXNzYWdlcywgY2FsbE9wdGlvbnMpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHBhcmFtcyA9IHtcbiAgICAgICAgICAgICAgICAuLi50aGlzLmludm9jYXRpb25QYXJhbXMoKSxcbiAgICAgICAgICAgICAgICBtb2RlbDogdGhpcy5tb2RlbE5hbWUsXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaWYgKGNhbGxPcHRpb25zPy5zdG9wKSB7XG4gICAgICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzKHBhcmFtcykuaW5jbHVkZXMoXCJzdG9wXCIpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcImBzdG9wYCBmb3VuZCBpbiBib3RoIHRoZSBpbnB1dCBhbmQgZGVmYXVsdCBwYXJhbXMuXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2VEaWN0cyA9IG1lc3NhZ2VzLm1hcCgobWVzc2FnZSkgPT4gX2NvbnZlcnRNZXNzYWdlVG9EaWN0KG1lc3NhZ2UpKTtcbiAgICAgICAgICAgIHJldHVybiBtZXNzYWdlRGljdHM7XG4gICAgICAgIH07XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZ2VuZXJhdGVkUmVzcG9uc2VzLmdlbmVyYXRpb25zLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICBjb25zdCBnZW5lcmF0aW9uID0gZ2VuZXJhdGVkUmVzcG9uc2VzLmdlbmVyYXRpb25zW2ldO1xuICAgICAgICAgICAgY29uc3QgbWVzc2FnZURpY3RzID0gX2NyZWF0ZU1lc3NhZ2VEaWN0cyhtZXNzYWdlcywgcGFyc2VkT3B0aW9ucyk7XG4gICAgICAgICAgICBsZXQgcHJvbXB0TGF5ZXJSZXF1ZXN0SWQ7XG4gICAgICAgICAgICBjb25zdCBwYXJzZWRSZXNwID0gW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGVudDogZ2VuZXJhdGlvbi50ZXh0LFxuICAgICAgICAgICAgICAgICAgICByb2xlOiBtZXNzYWdlVHlwZVRvT3BlbkFJUm9sZShnZW5lcmF0aW9uLm1lc3NhZ2UuX2dldFR5cGUoKSksXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF07XG4gICAgICAgICAgICBjb25zdCBwcm9tcHRMYXllclJlc3BCb2R5ID0gYXdhaXQgcHJvbXB0TGF5ZXJUcmFja1JlcXVlc3QodGhpcy5jYWxsZXIsIFwibGFuZ2NoYWluLlByb21wdExheWVyQ2hhdE9wZW5BSVwiLCBtZXNzYWdlRGljdHMsIHRoaXMuX2lkZW50aWZ5aW5nUGFyYW1zKCksIHRoaXMucGxUYWdzLCBwYXJzZWRSZXNwLCByZXF1ZXN0U3RhcnRUaW1lLCByZXF1ZXN0RW5kVGltZSwgdGhpcy5wcm9tcHRMYXllckFwaUtleSk7XG4gICAgICAgICAgICBpZiAodGhpcy5yZXR1cm5Qcm9tcHRMYXllcklkID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgaWYgKHByb21wdExheWVyUmVzcEJvZHkuc3VjY2VzcyA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICBwcm9tcHRMYXllclJlcXVlc3RJZCA9IHByb21wdExheWVyUmVzcEJvZHkucmVxdWVzdF9pZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCFnZW5lcmF0aW9uLmdlbmVyYXRpb25JbmZvIHx8XG4gICAgICAgICAgICAgICAgICAgIHR5cGVvZiBnZW5lcmF0aW9uLmdlbmVyYXRpb25JbmZvICE9PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICAgICAgICAgIGdlbmVyYXRpb24uZ2VuZXJhdGlvbkluZm8gPSB7fTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZ2VuZXJhdGlvbi5nZW5lcmF0aW9uSW5mby5wcm9tcHRMYXllclJlcXVlc3RJZCA9IHByb21wdExheWVyUmVxdWVzdElkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBnZW5lcmF0ZWRSZXNwb25zZXM7XG4gICAgfVxufVxuIl0sIm5hbWVzIjpbIkJhc2VMYW5ndWFnZU1vZGVsIiwiQ2FsbGJhY2tNYW5hZ2VyIiwiUlVOX0tFWSIsIkh1bWFuQ2hhdE1lc3NhZ2UiLCJBSUNoYXRNZXNzYWdlIiwiU3lzdGVtQ2hhdE1lc3NhZ2UiLCJDaGF0TWVzc2FnZSIsImdldEVudmlyb25tZW50VmFyaWFibGUiLCJmZXRjaEFkYXB0ZXIiLCJfYiIsIl9hIiwiX2MiLCJfZCIsIl9mIiwiX2UiLCJfaCIsIl9nIiwiX2kiLCJnZXRNb2RlbE5hbWVGb3JUaWt0b2tlbiIsIkNvbmZpZ3VyYXRpb24iLCJPcGVuQUlBcGkiLCJpc05vZGUiLCJtZXNzYWdlcyIsInByb21wdExheWVyVHJhY2tSZXF1ZXN0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUdPLE1BQU0sc0JBQXNCQSxhQUFBQSxrQkFBa0I7QUFBQSxFQUNqRCxZQUFZLFFBQVE7QUFDaEIsVUFBTSxNQUFNO0FBQUEsRUFDZjtBQUFBLEVBQ0QsTUFBTSxTQUFTLFVBQVUsU0FBUyxXQUFXOztBQUN6QyxVQUFNLGNBQWMsQ0FBQTtBQUNwQixVQUFNLGFBQWEsQ0FBQTtBQUNuQixRQUFJO0FBQ0osUUFBSSxNQUFNLFFBQVEsT0FBTyxHQUFHO0FBQ3hCLHNCQUFnQixFQUFFLE1BQU07SUFDM0IsWUFDUSxtQ0FBUyxZQUFXLENBQUMsUUFBUSxRQUFRO0FBQzFDLHNCQUFnQjtBQUFBLFFBQ1osR0FBRztBQUFBLFFBQ0gsUUFBUSxZQUFZLFFBQVEsUUFBUSxPQUFPO0FBQUEsTUFDM0Q7QUFBQSxJQUNTLE9BQ0k7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
