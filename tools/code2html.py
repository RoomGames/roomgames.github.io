# read content
input = open("input.txt", "r")
content = input.read()
input.close()

# replace content, from:https://stackoverflow.com/questions/22076190/highlightjs-with-html-code
content = content.replace("&", "&amp;")
content = content.replace("<", "&lt;")
content = content.replace(">", "&gt;")
content = content.replace("\"", "&quot;")
content = content.replace("'", "&#039;")

# write content
output = open("output.txt", "w")
output.write(content)
output.close()

# print content
print(content)